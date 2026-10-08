import { describe, expect, it } from 'vitest';
import { newRedditOnly, oldRedditRuleset } from './rules';

describe('old Reddit rules', () => {
  it('redirects www.reddit.com pages to old.reddit.com, except from old Reddit itself', () => {
    const [redirect] = oldRedditRuleset.rules;
    expect(redirect?.action).toEqual({
      type: 'redirect',
      redirect: { transform: { host: 'old.reddit.com' } },
    });
    expect(redirect?.condition.requestDomains).toEqual(['www.reddit.com']);
    expect(redirect?.condition.excludedInitiatorDomains).toEqual(['old.reddit.com']);
  });

  it('keeps pages old Reddit has no version of on new Reddit', () => {
    const allow = new RegExp(newRedditOnly);
    for (const url of [
      'https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fx.jpg',
      'https://www.reddit.com/gallery/1abcde',
      'https://www.reddit.com/r/pics/s/AbCdEf123',
      'https://www.reddit.com/notifications',
      'https://www.reddit.com/settings/account',
    ]) {
      expect(url).toMatch(allow);
    }
    for (const url of [
      'https://www.reddit.com/',
      'https://www.reddit.com/r/pics/',
      'https://www.reddit.com/r/pics/comments/1abcde/title/',
      'https://www.reddit.com/user/someone/',
      'https://www.reddit.com/r/settings/', // A subreddit, not the settings page.
    ]) {
      expect(url).not.toMatch(allow);
    }
  });
});
