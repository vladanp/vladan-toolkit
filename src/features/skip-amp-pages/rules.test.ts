import { describe, expect, it } from 'vitest';
import { ampCache, ampRuleset, googleAmp } from './rules';

/** Where a URL ends up, applying a rule's regex like Chrome does (`\1` = the first group). */
function redirect(pattern: string, url: string) {
  const match = new RegExp(pattern).exec(url);
  return match && `https://${match[1]}`;
}

describe('AMP rules', () => {
  it("send Google's AMP viewer links to the page itself", () => {
    expect(redirect(googleAmp, 'https://www.google.com/amp/s/news.example.com/story/amp')).toBe(
      'https://news.example.com/story/amp',
    );
    expect(redirect(googleAmp, 'https://www.google.co.uk/amp/s/example.org/a?b=1')).toBe(
      'https://example.org/a?b=1',
    );
  });

  it('send AMP cache links to the page itself', () => {
    expect(
      redirect(ampCache, 'https://news-example-com.cdn.ampproject.org/c/s/news.example.com/story'),
    ).toBe('https://news.example.com/story');
    expect(redirect(ampCache, 'https://x.cdn.ampproject.org/v/s/x.com/a?amp_js_v=0.1')).toBe(
      'https://x.com/a?amp_js_v=0.1',
    );
  });

  it('leave other Google and ampproject.org pages alone', () => {
    for (const url of [
      'https://www.google.com/search?q=amp',
      'https://www.google.com/amp/',
      'https://www.google.evil.com.example/amp/s/x.com', // Not a Google host: fails at "/amp".
      'https://cdn.ampproject.org/v0.js',
    ]) {
      expect(redirect(googleAmp, url) ?? redirect(ampCache, url), url).toBeNull();
    }
  });

  it('only redirect pages opened in a tab', () => {
    for (const rule of ampRuleset.rules)
      expect(rule.condition.resourceTypes).toEqual(['main_frame']);
  });
});
