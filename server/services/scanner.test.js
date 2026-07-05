import test from 'node:test';
import assert from 'node:assert/strict';

import { runChecks } from './scanner.js';

test('runChecks flags missing privacy policy on weak pages', () => {
  const results = runChecks({
    bodyText: 'Welcome to our website. We value your visit.',
    html: '<html><head><title>Home</title></head><body>Welcome</body></html>',
    links: [],
    metaTags: {}
  });

  const privacy = results.find((item) => item.checkId === 'privacyPolicy');
  assert.ok(privacy);
  assert.equal(privacy.passed, false);
});

test('runChecks passes when privacy and rights language exists', () => {
  const results = runChecks({
    bodyText:
      'Privacy Policy. Users may access, delete, correct, and withdraw consent. Cookie preferences available.',
    html: '<a href="/privacy">Privacy Policy</a>',
    links: [{ href: 'https://example.com/privacy', text: 'Privacy Policy' }],
    metaTags: {}
  });

  const privacy = results.find((item) => item.checkId === 'privacyPolicy');
  const rights = results.find((item) => item.checkId === 'userRights');

  assert.equal(privacy.passed, true);
  assert.equal(rights.passed, true);
});
