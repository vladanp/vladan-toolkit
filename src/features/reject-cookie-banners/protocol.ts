import type {
  ContentScriptMessage,
  EvalResponseMessage,
  InitResponseMessage,
} from '@duckduckgo/autoconsent';
import { rejectCookieBanners } from '.';

/**
 * Content script to background request. Autoconsent (DuckDuckGo's consent popup engine) runs in
 * every frame and asks the background for two things only: its rules/config, and running one of its
 * built in snippets in the page's own JavaScript world.
 */
export interface CookieBannerRequest {
  feature: typeof rejectCookieBanners.id;
  message: Extract<ContentScriptMessage, { type: 'init' | 'eval' }>;
}
export type CookieBannerResponse = InitResponseMessage | EvalResponseMessage | null;

export function isCookieBannerRequest(value: unknown): value is CookieBannerRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<CookieBannerRequest>).feature === rejectCookieBanners.id
  );
}
