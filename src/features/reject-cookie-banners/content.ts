import AutoConsent from '@duckduckgo/autoconsent';
import { browser } from 'wxt/browser';
import { rejectCookieBanners } from '.';
import type { CookieBannerRequest, CookieBannerResponse } from './protocol';

type Send = (request: CookieBannerRequest) => Promise<CookieBannerResponse>;

/**
 * Starts autoconsent in this frame: it finds the consent popup, rejects it (opt out) or hides it.
 * Returns a function that stops it from acting further.
 */
export function startRejecting(
  send: Send = (request) => browser.runtime.sendMessage(request),
): () => void {
  let active = true;
  const consent: AutoConsent = new AutoConsent(async (message) => {
    // Only these need the background; status reports etc. are dropped to keep it idle.
    if (!active || (message.type !== 'init' && message.type !== 'eval')) return;
    try {
      const reply = await send({ feature: rejectCookieBanners.id, message });
      if (active && reply) await consent.receiveMessageCallback(reply);
    } catch {
      // The extension was reloaded or updated while this page stayed open.
    }
  });
  return () => {
    active = false;
    try {
      consent.undoPrehide();
    } catch {
      // Not initialized yet: nothing was hidden.
    }
  };
}
