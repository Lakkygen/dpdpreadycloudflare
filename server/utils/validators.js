export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function safeInteger(value, fallback = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function isValidHttpUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeWebsiteUrl(input) {
  if (!isNonEmptyString(input)) {
    throw new Error('A website URL is required.');
  }
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function stripHtml(html = '') {
  if (!isNonEmptyString(html)) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function clampNumber(value, min = 0, max = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

export function isValidEmail(email) {
  if (!isNonEmptyString(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeUrlForScan(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const blockedHosts = [
      'localhost', '127.0.0.1', '0.0.0.0', '::1',
      'metadata.google.internal', 'metadata', '169.254.169.254',
    ];
    if (blockedHosts.includes(hostname)) {
      throw new Error('Scanning internal addresses is not allowed');
    }
    const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const [, a, b, c, d] = ipMatch.map(Number);
      if (a === 10) throw new Error('Private IP range not allowed');
      if (a === 172 && b >= 16 && b <= 31) throw new Error('Private IP range not allowed');
      if (a === 192 && b === 168) throw new Error('Private IP range not allowed');
      if (a === 127) throw new Error('Loopback address not allowed');
      if (a === 0) throw new Error('Invalid IP range');
    }
    return parsed.toString();
  } catch (err) {
    if (err.message.includes('not allowed')) throw err;
    throw new Error('Invalid URL format');
  }
}
