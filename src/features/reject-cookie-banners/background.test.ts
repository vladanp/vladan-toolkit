import { describe, expect, it, vi } from 'vitest';
import { answerCookieBannerRequest } from './background';

const sender = (frameId: number, url: string) => ({ tab: { id: 7 }, frameId, url });

describe('answerCookieBannerRequest', () => {
  it('sends a frame its config and only the rules that can apply to it', async () => {
    const top = await answerCookieBannerRequest(
      { feature: 'reject-cookie-banners', message: { type: 'init', url: 'https://example.com/' } },
      sender(0, 'https://example.com/'),
    );
    const frame = await answerCookieBannerRequest(
      {
        feature: 'reject-cookie-banners',
        message: { type: 'init', url: 'https://cmp.example.net/' },
      },
      sender(3, 'https://cmp.example.net/'),
    );
    if (top?.type !== 'initResp' || frame?.type !== 'initResp')
      throw new Error('expected initResp');

    expect(top.config).toMatchObject({ enabled: true, autoAction: 'optOut' });
    const topRules = top.rules.compact?.r.length ?? 0;
    const frameRules = frame.rules.compact?.r.length ?? 0;
    expect(topRules).toBeGreaterThan(100);
    expect(frameRules).toBeGreaterThan(0);
    expect(frameRules).toBeLessThan(topRules);
  });

  it('runs only bundled snippets, in the requesting frame', async () => {
    const run = vi.fn(async () => true);
    const known = await answerCookieBannerRequest(
      {
        feature: 'reject-cookie-banners',
        message: { type: 'eval', id: 'a', code: '', snippetId: 'EVAL_COOKIEBOT_1' },
      },
      sender(2, 'https://example.com/'),
      run,
    );
    expect(run).toHaveBeenCalledWith(7, 2, 'EVAL_COOKIEBOT_1');
    expect(known).toEqual({ type: 'evalResp', id: 'a', result: true });

    run.mockClear();
    const unknown = await answerCookieBannerRequest(
      {
        feature: 'reject-cookie-banners',
        // Raw code (no snippet id) is never evaluated.
        message: { type: 'eval', id: 'b', code: 'alert(1)' },
      },
      sender(0, 'https://example.com/'),
      run,
    );
    expect(run).not.toHaveBeenCalled();
    expect(unknown).toEqual({ type: 'evalResp', id: 'b', result: false });
  });

  it('reports false when a snippet fails', async () => {
    const reply = await answerCookieBannerRequest(
      {
        feature: 'reject-cookie-banners',
        message: { type: 'eval', id: 'c', code: '', snippetId: 'EVAL_COOKIEBOT_1' },
      },
      sender(0, 'https://example.com/'),
      async () => {
        throw new Error('frame is gone');
      },
    );
    expect(reply).toEqual({ type: 'evalResp', id: 'c', result: false });
  });
});
