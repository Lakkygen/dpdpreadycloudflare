import { analyseWithAI } from './aiAnalysis.js';
import { normalizeWebsiteUrl, stripHtml, sanitizeUrlForScan } from '../utils/validators.js';
import { calculateScore } from './scoreCalculator.js';

export const CHECKS = [
  { id: 'consentBanner', label: 'Consent Banner', weight: 25 },
  { id: 'cookieConsent', label: 'Cookie Consent Mechanism', weight: 20 },
  { id: 'dataRetention', label: 'Data Retention Policy', weight: 15 },
  { id: 'thirdPartySharing', label: 'Third-Party Data Sharing', weight: 15 },
  { id: 'privacyPolicy', label: 'Privacy Policy Completeness', weight: 15 },
  { id: 'userRights', label: 'User Rights (access, erasure, portability)', weight: 10 },
];

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function performScan(url) {
  const normalizedUrl = normalizeWebsiteUrl(url);
  sanitizeUrlForScan(normalizedUrl);

  const crawledData = await crawlWebsite(normalizedUrl);
  const heuristicResults = runHeuristicChecks(crawledData);
  const aiResult = await analyseWithAI(crawledData, heuristicResults);

  const allResults = [...heuristicResults, ...(aiResult.issues || [])];
  const overallScore = calculateScore(allResults);

  return {
    url: normalizedUrl,
    overallScore,
    aiConfidence: aiResult.confidence,
    summary: aiResult.summary,
    recommendations: allResults,
    crawledAt: new Date().toISOString(),
  };
}

async function crawlWebsite(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const finalUrl = response.url;

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const metaTags = {};
    const metaMatches = html.matchAll(/<meta[^>]*?(?:name|property)="([^"]+)"[^>]*?content="([^"]+)"/gi);
    for (const match of metaMatches) {
      metaTags[match[1].toLowerCase()] = match[2];
    }

    const links = [];
    const linkMatches = html.matchAll(/<a[^>]*?href="([^"]+)"[^>]*?>(.*?)<\/a>/gi);
    for (const match of linkMatches) {
      try {
        const absoluteUrl = new URL(match[1], finalUrl).href;
        links.push({ url: absoluteUrl, text: stripHtml(match[2]).slice(0, 100) });
      } catch {
        // Skip invalid URLs
      }
    }

    return {
      url,
      finalUrl,
      title,
      bodyText: stripHtml(html).slice(0, 50000),
      metaTags,
      links: links.slice(0, 50),
      rawHtml: html.slice(0, 100000),
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Website crawl timed out after 15 seconds');
    }
    throw error;
  }
}

function runHeuristicChecks(crawledData) {
  const results = [];
  const text = (crawledData.bodyText || '').toLowerCase();
  const html = (crawledData.rawHtml || '').toLowerCase();

  const hasConsentBanner =
    html.includes('cookie') &&
    (html.includes('consent') || html.includes('accept') || html.includes('gdpr'));
  results.push({
    checkId: 'consentBanner',
    label: 'Consent Banner',
    weight: 25,
    passed: hasConsentBanner,
    score: hasConsentBanner ? 80 : 20,
    severity: hasConsentBanner ? 'low' : 'high',
    evidence: hasConsentBanner ? 'Cookie consent banner detected' : 'No cookie consent banner found',
  });

  const hasCookieConsent =
    html.includes('cookie-policy') ||
    html.includes('cookie policy') ||
    html.includes('manage cookies');
  results.push({
    checkId: 'cookieConsent',
    label: 'Cookie Consent Mechanism',
    weight: 20,
    passed: hasCookieConsent,
    score: hasCookieConsent ? 85 : 30,
    severity: hasCookieConsent ? 'low' : 'medium',
    evidence: hasCookieConsent ? 'Cookie management mechanism found' : 'No cookie management found',
  });

  const hasDataRetention =
    text.includes('data retention') ||
    text.includes('retain your data') ||
    text.includes('how long we keep');
  results.push({
    checkId: 'dataRetention',
    label: 'Data Retention Policy',
    weight: 15,
    passed: hasDataRetention,
    score: hasDataRetention ? 90 : 25,
    severity: hasDataRetention ? 'low' : 'medium',
    evidence: hasDataRetention ? 'Data retention policy mentioned' : 'No data retention policy found',
  });

  const hasThirdPartyInfo =
    text.includes('third party') ||
    text.includes('third-party') ||
    text.includes('share your data') ||
    text.includes('partners');
  results.push({
    checkId: 'thirdPartySharing',
    label: 'Third-Party Data Sharing',
    weight: 15,
    passed: hasThirdPartyInfo,
    score: hasThirdPartyInfo ? 75 : 35,
    severity: hasThirdPartyInfo ? 'low' : 'medium',
    evidence: hasThirdPartyInfo ? 'Third-party sharing disclosures found' : 'No third-party sharing disclosures',
  });

  const hasPrivacyPolicy =
    html.includes('privacy policy') ||
    html.includes('privacy-policy') ||
    crawledData.links.some((l) => l.url.toLowerCase().includes('privacy'));
  const privacyLength = text.includes('privacy policy') ? text.split('privacy policy')[1]?.length || 0 : 0;
  results.push({
    checkId: 'privacyPolicy',
    label: 'Privacy Policy Completeness',
    weight: 15,
    passed: hasPrivacyPolicy,
    score: hasPrivacyPolicy ? (privacyLength > 500 ? 90 : 60) : 15,
    severity: hasPrivacyPolicy ? 'low' : 'critical',
    evidence: hasPrivacyPolicy
      ? `Privacy policy found (${privacyLength > 500 ? 'comprehensive' : 'brief'})`
      : 'No privacy policy found',
  });

  const hasUserRights =
    text.includes('access your data') ||
    text.includes('delete your data') ||
    text.includes('data portability') ||
    text.includes('right to erasure') ||
    text.includes('right to access');
  results.push({
    checkId: 'userRights',
    label: 'User Rights',
    weight: 10,
    passed: hasUserRights,
    score: hasUserRights ? 85 : 20,
    severity: hasUserRights ? 'low' : 'high',
    evidence: hasUserRights ? 'User rights information found' : 'No user rights information found',
  });

  return results;
}
