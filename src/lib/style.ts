/**
 * Adds a stylesheet to a page (or to an open shadow root, which page-level CSS can't reach), tagged
 * with the owning feature's id. Returns a function that removes it again.
 *
 * The rules are put in a cascade layer: an `!important` declaration in a layer beats every unlayered
 * `!important` one of the page, however specific its selector (only inline `!important` styles win).
 * So write every declaration with `!important`; normal ones would lose to the page's.
 */
export function injectStyle(
  css: string,
  owner: string,
  root: Document | ShadowRoot = document,
): () => void {
  const doc = root.ownerDocument ?? (root as Document);
  const style = doc.createElement('style');
  style.dataset.vladanToolkit = owner;
  style.textContent = `@layer vladan-toolkit {\n${css}\n}`;
  // At document_start <head> doesn't exist yet; a <style> under <html> still applies.
  const parent = 'host' in root ? root : (root.head ?? root.documentElement);
  parent.append(style);
  return () => style.remove();
}
