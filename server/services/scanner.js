import { analyseWithAI } from './aiAnalysis.js';
import { normalizeWebsiteUrl, stripHtml, clampNumber } from '../utils/validators.js';

export const CHECKS = [
  { id: 'consentBanner', label: 'Consent Banner', weight: 25 },
  { id: 'cookieConsent', label: 'Cookie Consent Mechanism', weight: 20 },
  { id: 'dataRetention', label: 'Data Retention Policy', weight: 15 },
  { id: 'thirdPartySharing', label: 'Third-Party Data Sharing', weight: 15 },
  { id: 'privacyPolicy', label: 'Privacy Policy Completeness', weight: 15 },
  { id: 'userRights', label: 'User Rights (access, erasure, portability)', weight: 10 }
];

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9'
};

const PRIVACY_KEYWORDS = [
  'privacy',
  'cookie',
  'consent',
  'gdpr',
  'data protection',
  'data sharing',
  'data retention',
  'policy',
  'rights'
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(signal, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        controller.abort();
      },
      { once: true }
    );
  }

  return {
    signal: controller.signal,
    cancel() {
      clearTimeout(timeout);
      controller.abort();
    }
  };
}

function safeJoinUrl(base, href) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function extractMetaTags(html = '') {
  const metaTags = {};
  const metaRegex =
    /<meta\s+([^>]*?(?:name|property)\s*=\s*["']?([^"'>\s]+)[^>]*?)\s+content\s*=\s*["']([^"']*)["'][^>]*>/gi;

  let match;
  while ((match = metaRegex.exec(html))) {
    const key = match[2]?.trim();
    const value = match[3]?.trim();
    if (key && value) metaTags[key] = value;
  }

  return metaTags;
}

function extractTitle(html = '') {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]) : '';
}

function extractAnchors(html = '', baseUrl) {
  const links = [];
  const anchorRegex = /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi;
  const hrefRegex = /href\s*=\s*["']?([^"'\s>]+)["']?/i;

  let match;
  while ((match = anchorRegex.exec(html))) {
    const attrs = match[1] || '';
    const text = stripHtml(match[2] || '');
    const hrefMatch = attrs.match(hrefRegex);
    if (!hrefMatch) continue;

    const href = hrefMatch[1].trim();
    const absolute = safeJoinUrl(baseUrl, href);
    if (!absolute) continue;

    const lowerText = text.toLowerCase();
    const lowerHref = href.toLowerCase();

    if (
      PRIVACY_KEYWORDS.some(
        (keyword) => lowerText.includes(keyword) || lowerHref.includes(keyword)
      )
    ) {
      links.push({
        href: absolute,
        text: text || absolute
      });
    }
  }

  return Array.from(new Map(links.map((link) => [link.href, link])).values());
}

async function fetchPage(url) {
  const timeout = withTimeout(null, 15000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: DEFAULT_HEADERS,
      signal: timeout.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const html = await response.text();
    const finalUrl = response.url || url;

    return {
      url,
      finalUrl,
      html,
      title: extractTitle(html),
      bodyText: stripHtml(html),
      metaTags: extractMetaTags(html),
      links: []
    };
  } finally {
    timeout.cancel();
  }
}

export async function crawlWebsite(inputUrl, maxPages = 3) {
  const normalizedUrl = normalizeWebsiteUrl(inputUrl);
  const baseUrl = new URL(normalizedUrl).origin;

  const pages = [];
  const visited = new Set();
  const queue = [normalizedUrl];

  while (queue.length && pages.length < maxPages) {
    const nextUrl = queue.shift();
    if (!nextUrl || visited.has(nextUrl)) continue;
    visited.add(nextUrl);

    try {
      const page = await fetchPage(nextUrl);
      page.links = extractAnchors(page.html, baseUrl);
      pages.push(page);

      for (const link of page.links) {
        if (pages.length + queue.length >= maxPages) break;
        if (link.href && !visited.has(link.href)) {
          queue.push(link.href);
        }
      }
    } catch (error) {
      pages.push({
        url: nextUrl,
        finalUrl: nextUrl,
        html: '',
        title: '',
        bodyText: '',
        metaTags: {},
        links: [],
        error: error.message
      });
      await delay(250);
    }
  }

  const combinedText = pages.map((page) => page.bodyText || '').join(' ').replace(/\s+/g, ' ').trim();
  const combinedHtml = pages.map((page) => page.html || '').join('\n');
  const allLinks = Array.from(
    new Map(pages.flatMap((page) => page.links || []).map((link) => [link.href, link])).values()
  );
  const mergedMeta = pages.reduce((acc, page) => {
    Object.assign(acc, page.metaTags || {});
    return acc;
  }, {});

  return {
    url: normalizedUrl,
    finalUrl: pages.find((page) => page.finalUrl)?.finalUrl || normalizedUrl,
    pages,
    html: combinedHtml,
    bodyText: combinedText,
    links: allLinks,
    metaTags: mergedMeta,
    title: pages.find((page) => page.title)?.title || ''
  };
}

function buildFinding(checkId, passed, score, severity, evidence, suggestedFix) {
  const check = CHECKS.find((item) => item.id === checkId);
  return {
    checkId,
    label: check?.label || checkId,
    passed,
    status: passed ? 'passed' : 'failed',
    score: clampNumber(score, 0, 100),
    weight: check?.weight ?? 1,
    severity,
    evidence,
    suggestedFix
  };
}

export function runChecks(crawledData) {
  const body = (crawledData?.bodyText || '').toLowerCase();
  const html = crawledData?.html || '';
  const links = crawledData?.links || [];
  const metaTags = crawledData?.metaTags || {};

  const results = [];

  const consentFound = /consent|cookie banner|cookie preferences|manage cookies|privacy settings/i.test(
    body
  );
  results.push(
    buildFinding(
      'consentBanner',
      consentFound,
      consentFound ? 100 : 35,
      consentFound ? 'info' : 'critical',
      consentFound ? 'Consent-related language or banner detected.' : 'No visible consent banner found.',
      consentFound
        ? 'Keep the consent banner visible and easy to reject.'
        : 'Add a clear consent banner with accept and reject controls.'
    )
  );

  const cookieFound = /opt-?in|reject all|cookie settings|cookie preferences|manage cookies/i.test(
    body + ' ' + html
  );
  results.push(
    buildFinding(
      'cookieConsent',
      cookieFound,
      cookieFound ? 100 : 30,
      cookieFound ? 'info' : 'warning',
      cookieFound ? 'Cookie preferences controls were detected.' : 'No cookie control text found.',
      cookieFound
        ? 'Make cookie choices accessible from every page.'
        : 'Add cookie preference controls and a reject option.'
    )
  );

  const retentionFound = /retain|retention|stored for|days|months|years|delete after/i.test(body);
  results.push(
    buildFinding(
      'dataRetention',
      retentionFound,
      retentionFound ? 90 : 45,
      retentionFound ? 'info' : 'warning',
      retentionFound ? 'Retention language detected.' : 'No retention period language found.',
      retentionFound
        ? 'Keep retention language specific and easy to find.'
        : 'Add a retention section with storage duration and deletion rules.'
    )
  );

  const thirdPartyFound = /third.?party|partner|affiliate|share(?:s|d)? data|service provider/i.test(
    body
  );
  results.push(
    buildFinding(
      'thirdPartySharing',
      thirdPartyFound,
      thirdPartyFound ? 85 : 40,
      thirdPartyFound ? 'info' : 'warning',
      thirdPartyFound
        ? 'Third-party sharing language detected.'
        : 'No obvious third-party sharing explanation found.',
      thirdPartyFound
        ? 'List categories of third parties and purposes.'
        : 'Explain which third parties receive data and why.'
    )
  );

  const privacyPolicyLink = links.some((link) => /privacy/i.test(link.text || link.href || ''));
  const privacyPolicyMention = /privacy policy|privacy notice|policy/i.test(body);
  const privacyPolicy = privacyPolicyLink || privacyPolicyMention;
  results.push(
    buildFinding(
      'privacyPolicy',
      privacyPolicy,
      privacyPolicy ? 100 : 20,
      privacyPolicy ? 'info' : 'critical',
      privacyPolicy
        ? 'Privacy policy language or link found.'
        : 'No clear privacy policy link or mention found.',
      privacyPolicy
        ? 'Keep the policy linked in the footer and onboarding flows.'
        : 'Add a clearly labeled privacy policy page and footer link.'
    )
  );

  const rightsFound = /access|erasure|delete|portability|rectification|correct|withdraw consent|grievance/i.test(
    body + ' ' + html
  );
  results.push(
    buildFinding(
      'userRights',
      rightsFound,
      rightsFound ? 100 : 30,
      rightsFound ? 'info' : 'critical',
      rightsFound ? 'User-rights language detected.' : 'No user-rights language found.',
      rightsFound
        ? 'Keep rights instructions visible and actionable.'
        : 'Add a user-rights section covering access, deletion, correction, and complaint channels.'
    )
  );

  const titlePresent = Boolean(crawledData?.title);
  if (!titlePresent && metaTags?.description) {
    results.push(
      buildFinding(
        'metadata',
        true,
        75,
        'info',
        'Description meta tag found, but page title was missing.',
        'Add a descriptive page title for clarity and trust.'
      )
    );
  }

  return results;
}

function calculateWeightedScore(results = []) {
  if (!Array.isArray(results) || results.length === 0) return 0;

  const totals = results.reduce(
    (acc, result) => {
      const weight = Number(result.weight ?? 1);
      const score = clampNumber(result.score ?? (result.passed ? 100 : 0), 0, 100);
      acc.weight += weight;
      acc.points += weight * score;
      return acc;
    },
    { weight: 0, points: 0 }
  );

  if (!totals.weight) return 0;
  return Math.round(totals.points / totals.weight);
}

export async function performScan(inputUrl) {
  const crawledData = await crawlWebsite(inputUrl);
  const heuristicResults = runChecks(crawledData);
  const heuristicScore = calculateWeightedScore(heuristicResults);
  const aiResult = await analyseWithAI(crawledData, heuristicResults);

  const finalScore =
    typeof aiResult?.overallScore === 'number' ? aiResult.overallScore : heuristicScore;

  const issues = Array.isArray(aiResult?.issues) && aiResult.issues.length
    ? aiResult.issues
    : heuristicResults.map((item) => ({
        checkId: item.checkId,
        title: item.label,
        description: item.passed
          ? 'This area appears to be addressed.'
          : 'This area needs improvement.',
        suggestedFix: item.suggestedFix,
        passed: item.passed,
        severity: item.severity,
        evidence: item.evidence,
        score: item.score
      }));

  return {
    url: crawledData.url,
    finalUrl: crawledData.finalUrl,
    title: crawledData.title,
    scannedAt: new Date().toISOString(),
    pages: crawledData.pages,
    heuristicResults,
    aiAnalysis: aiResult,
    issues,
    overallScore: finalScore,
    confidence: aiResult?.confidence ?? 0.5,
    summary: aiResult?.summary || 'Website scan completed successfully.'
  };
}
