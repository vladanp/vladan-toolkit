import {
  type Config,
  evalSnippets,
  filterCompactRules,
  type IndexedCMPRuleset,
} from '@duckduckgo/autoconsent';
import compactRules from '@duckduckgo/autoconsent/rules/compact-rules.json';
import { browser } from 'wxt/browser';
import type { CookieBannerRequest, CookieBannerResponse } from './protocol';

const rules = compactRules as unknown as IndexedCMPRuleset;

export const autoconsentConfig: Partial<Config> = {
  enabled: true,
  autoAction: 'optOut', // Reject.
  enablePrehide: true, // Hide known pop-ups right away, so they don't flash.
  enableCosmeticRules: true, // Hide pop-ups that can't be rejected.
  enableGeneratedRules: true,
  heuristicMode: 'reject', // Also click "Reject" on unknown cookie pop-ups.
  logs: {
    lifecycle: false,
    rulesteps: false,
    detectionsteps: false,
    evals: false,
    errors: false,
    messages: false,
    waits: false,
  },
};

interface Sender {
  tab?: { id?: number };
  frameId?: number;
  url?: string;
}

/** Runs one of autoconsent's bundled snippets (never arbitrary code) in the page's own JS world. */
async function runSnippet(tabId: number, frameId: number, snippetId: keyof typeof evalSnippets) {
  const [injection] = await browser.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    world: 'MAIN',
    func: evalSnippets[snippetId],
  });
  return injection?.result ?? false;
}

/** Background side of the cookie banner feature: answers a frame's autoconsent request. */
export async function answerCookieBannerRequest(
  { message }: CookieBannerRequest,
  sender: Sender,
  run = runSnippet,
): Promise<CookieBannerResponse> {
  const tabId = sender.tab?.id;
  const frameId = sender.frameId ?? 0;
  if (message.type === 'init') {
    return {
      type: 'initResp',
      // Only the rules that can apply to this page (generic ones + this site's), not all ~1000.
      rules: {
        autoconsent: [],
        compact: filterCompactRules(rules, {
          url: sender.url ?? message.url,
          mainFrame: frameId === 0,
        }),
      },
      config: autoconsentConfig as Config,
    };
  }
  let result = false;
  if (tabId !== undefined && message.snippetId && Object.hasOwn(evalSnippets, message.snippetId)) {
    result = await run(tabId, frameId, message.snippetId).catch(() => false);
  }
  return { type: 'evalResp', id: message.id, result };
}
