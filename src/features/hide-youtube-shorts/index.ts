import type { Feature } from '@/lib/features';
import css from './hide-shorts.css?inline';

export const hideYoutubeShorts = {
  id: 'hide-youtube-shorts',
  name: 'Hide YouTube Shorts',
  description:
    'Hides Shorts shelves, Shorts in feeds and search, and the Shorts menu entries and tab.',
  enabledByDefault: true,
} satisfies Feature;

/** Adds the hiding stylesheet to the page; returns a function that removes it. */
export function injectHideShortsStyle(doc: Document = document): () => void {
  const style = doc.createElement('style');
  style.dataset.vladanToolkit = hideYoutubeShorts.id;
  style.textContent = css;
  // At document_start <head> doesn't exist yet; a <style> under <html> still applies.
  (doc.head ?? doc.documentElement).append(style);
  return () => style.remove();
}
