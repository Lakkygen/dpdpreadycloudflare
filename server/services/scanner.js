import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
];

// The rest of your file (performScan, etc.) remains unchanged.
// Make sure to export performScan as well.

// Check definitions (used later by AI too)
const CHECKS = [
  { id: 'consentBanner', label: 'Consent Banner', weight: 25 },
  { id: 'cookieConsent', label: 'Cookie Consent Mechanism', weight: 20 },
  { id: 'dataRetention', label: 'Data Retention Policy', weight: 15 },
  { id: 'thirdPartySharing', label: 'Third‑Party Data Sharing', weight: 15 },
  { id: 'privacyPolicy', label: 'Privacy Policy Completeness', weight: 15 },
  { id: 'userRights', label: 'User Rights (access, erasure, portability)', weight: 10 },
];

/**
 * Crawl a website and extract text, meta tags, and links.
 * Retries up to 2 times on network failure.
 * Returns raw page data for analysis.
 */
export async function crawlWebsite(url) {
  // Normalise URL
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  const baseUrl = new URL(url).origin;

  const axiosConfig = {
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    maxRedirects: 3,
  };

  // Retry logic
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await axios.get(url, axiosConfig);
      const html = response.data;
      const $ = cheerio.load(html);

      // Basic text extraction (removes scripts, styles)
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

      // Extract privacy‑related links
      const links = [];
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().toLowerCase();
        if (href && (text.includes('privacy') || text.includes('cookie') || text.includes('data'))) {
          try {
            const absolute = new URL(href, baseUrl).href;
            links.push({ href: absolute, text: $(el).text().trim() });
          } catch {}
        }
      });

      // Meta tags
      const metaTags = {};
      $('meta').each((_, el) => {
        const name = $(el).attr('name') || $(el).attr('property');
        const content = $(el).attr('content');
        if (name && content) metaTags[name] = content;
      });

      return {
        url,
        finalUrl: response.request.res.responseUrl || url, // final after redirects
        html,               // raw HTML for deeper analysis if needed
        bodyText,
        links,
        metaTags,
      };
    } catch (err) {
      lastError = err;
      if (err.response?.status === 403) break; // no point retrying forbidden
      // wait 1s before retry
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error(`Failed to crawl ${url}: ${lastError?.message}`);
}

/**
 * Run the 6 DPDP checks on crawled data.
 * This is a heuristic engine – it can be augmented by AI.
 */
export function runChecks(crawledData) {
  const { bodyText, html, links, metaTags } = crawledData;
  const results = [];

  // 1. Consent Banner – look for keywords
  const consentKeywords = ['consent', 'cookie', 'gdpr', 'privacy preference', 'manage cookies'];
  const consentFound = consentKeywords.some(k => bodyText.toLowerCase().includes(k));
  results.push({
    checkId: 'consentBanner',
    status: consentFound ? 'passed' : 'failed',
    score: consentFound ? 100 : 40,
    severity: consentFound ? 'info' : 'critical',
  });

  // 2. Cookie Consent – look for “opt-in” or “cookie settings”
  const cookieOptIn = /opt-?in|cookie settings|reject all/i.test(bodyText);
  results.push({
    checkId: 'cookieConsent',
    status: cookieOptIn ? 'passed' : 'failed',
    score: cookieOptIn ? 100 : 30,
    severity: cookieOptIn ? 'info' : 'warning',
  });

  // 3. Data Retention – mention of retention period
  const retention = /retain|retention|period|days|months|years/i.test(bodyText);
  results.push({
    checkId: 'dataRetention',
    status: retention ? 'passed' : 'failed',
    score: retention ? 90 : 50,
    severity: retention ? 'info' : 'warning',
  });

  // 4. Third‑party sharing – mention of third parties, partners, affiliates
  const thirdParty = /third.?party|partners|affiliates|share.*data/i.test(bodyText);
  results.push({
    checkId: 'thirdPartySharing',
    status: thirdParty ? 'passed' : 'failed',
    score: thirdParty ? 85 : 40,
    severity: thirdParty ? 'info' : 'warning',
  });

  // 5. Privacy Policy – must have a link to privacy policy
  const policyLink = links.some(l => l.text.includes('privacy') && l.href);
  results.push({
    checkId: 'privacyPolicy',
    status: policyLink ? 'passed' : 'failed',
    score: policyLink ? 100 : 20,
    severity: policyLink ? 'info' : 'critical',
  });

  // 6. User Rights – look for access, erasure, portability
  const rightsKeywords = ['access', 'erasure', 'portability', 'rectification', 'objection'];
  const rightsFound = rightsKeywords.some(k => bodyText.toLowerCase().includes(k));
  results.push({
    checkId: 'userRights',
    status: rightsFound ? 'passed' : 'failed',
    score: rightsFound ? 100 : 30,
    severity: rightsFound ? 'info' : 'critical',
  });

  return results;
}
