import { injectStyle } from '@/lib/style';
import { cleanReddit } from '.';
import pageCss from './clean-reddit.css?inline';
import searchCss from './search.css?inline';

/** Hides Reddit clutter, also inside the search box's shadow root. Returns the cleanup. */
export function startCleaning(doc: Document = document): () => void {
  const undo = [injectStyle(pageCss, cleanReddit.id, doc)];
  const styled = new WeakSet<ShadowRoot>();

  // The search box renders (and may be re-created) after load, so check again as the page changes.
  const styleSearchBoxes = () => {
    for (const box of doc.querySelectorAll('reddit-search-large')) {
      const root = box.shadowRoot;
      if (root && !styled.has(root)) {
        styled.add(root);
        undo.push(injectStyle(searchCss, cleanReddit.id, root));
      }
    }
  };
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      styleSearchBoxes();
    });
  });
  observer.observe(doc, { childList: true, subtree: true });
  styleSearchBoxes();

  return () => {
    observer.disconnect();
    for (const remove of undo) remove();
  };
}
