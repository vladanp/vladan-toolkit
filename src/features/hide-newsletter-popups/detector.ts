import { injectStyle } from '@/lib/style';
import { hideNewsletterPopups } from '.';

const owner = hideNewsletterPopups.id;
const hiddenAttribute = 'data-vladan-toolkit-hidden';
const unlockAttribute = 'data-vladan-toolkit-unlock';

const css = `
[${hiddenAttribute}="${owner}"] { display: none !important; }
html[${unlockAttribute}="${owner}"], html[${unlockAttribute}="${owner}"] > body { overflow: auto !important; }
`;

const emailInputs =
  'input[type="email" i], input[autocomplete="email" i], input[name*="email" i], input[id*="email" i], input[placeholder*="mail" i]';
const textInputs =
  'input:not([type]), input[type="text" i], input[type="email" i], input[type="tel" i], input[type="number" i], textarea';
// Pop-ups sometimes announce themselves as dialogs; cheap to check on every scan.
const dialogs = '[role="dialog"], [role="alertdialog"], [aria-modal="true"], dialog[open]';

/** Sign-up and discount offers (a pop-up with an email field needs no such words). */
export const signupOffer =
  /\b\d{1,2}\s?%\s*(?:off|discount)\b|\bsave\s+(?:up\s+to\s+)?\d{1,2}\s?%|\bdiscount\b|\bnewsletter\b|\bsubscribe\b|\bfirst\s+(?:order|purchase)\b|\bexclusive\s+(?:offers?|deals?|access|discounts?)\b|\bjoin\s+(?:our|the)\s+(?:list|club|community|newsletter|mailing\s+list|vip)\b|\bmailing\s+list\b|\bsign\s+up\s+(?:for|to\s+(?:get|receive|save))\b/i;

// A pop-up appearing this soon after a click (or Enter/Space) was opened by the user: leave it.
const userOpenedWithinMs = 1500;
const maxTargetsPerScan = 200;

/**
 * Hides sign-up pop-ups: fixed overlays the user didn't open that ask for an email address or offer a
 * discount for signing up, and aren't a sign-in or big form. Their dimmed backdrops go too, and
 * scrolling is unlocked. Returns a function that undoes everything.
 */
export function startHidingNewsletterPopups(win: Window = window): () => void {
  const doc = win.document;
  const removeStyle = injectStyle(css, owner, doc);
  const hidden = new Set<Element>();
  const userOpened = new WeakSet<Element>();
  let lastInteraction = Number.NEGATIVE_INFINITY;
  const onPointer = () => {
    lastInteraction = win.performance.now();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') lastInteraction = win.performance.now();
  };

  const style = (el: Element) => win.getComputedStyle(el);
  const visible = (el: Element) => {
    const rect = el.getBoundingClientRect();
    const onScreen =
      rect.right > 0 && rect.bottom > 0 && rect.left < win.innerWidth && rect.top < win.innerHeight;
    if (rect.width < 2 || rect.height < 2 || !onScreen) return false; // Off-canvas drawers too.
    const { visibility, opacity } = style(el);
    return visibility !== 'hidden' && Number(opacity) > 0.05;
  };

  /** The outermost fixed-position element around `el` (or `el` itself): the whole pop-up. */
  const overlayOf = (el: Element) => {
    let overlay: Element | undefined;
    for (let node: Element | null = el; node && node !== doc.body; node = node.parentElement) {
      if (node === doc.documentElement) return undefined;
      if (style(node).position === 'fixed') overlay = node;
    }
    return overlay;
  };

  const isSmallForm = (overlay: Element) =>
    !overlay.querySelector('input[type="password" i]') && // Sign-in, not sign-up.
    overlay.querySelectorAll(textInputs).length <= 4 && // Not a checkout or contact form.
    overlay.querySelectorAll('*').length <= 300 && // Not a whole app laid out with position: fixed.
    !overlay.querySelector('main, article, [role="main"]');

  const asksForEmail = (overlay: Element) =>
    [...overlay.querySelectorAll(emailInputs)].some((input) => visible(input));

  const offersSignup = (overlay: Element) => {
    const rect = overlay.getBoundingClientRect();
    const text = (overlay.textContent ?? '').replace(/\s+/g, ' ').trim();
    return rect.width >= 250 && rect.height >= 150 && text.length <= 600 && signupOffer.test(text);
  };

  // Full-screen, nearly empty fixed layers: the dimmed background behind a pop-up.
  const isBackdrop = (el: Element) => {
    if (style(el).position !== 'fixed' || !visible(el)) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width >= win.innerWidth * 0.9 &&
      rect.height >= win.innerHeight * 0.9 &&
      (el.textContent ?? '').trim().length < 20 &&
      !el.querySelector('input, button, a, img, video, iframe, canvas')
    );
  };

  const hide = (el: Element) => {
    el.setAttribute(hiddenAttribute, owner);
    hidden.add(el);
  };

  const scrollLocked = () =>
    [doc.documentElement, doc.body].some((el) => style(el).overflowY === 'hidden');

  const check = (overlay: Element) => {
    if (hidden.has(overlay) || userOpened.has(overlay) || !visible(overlay)) return;
    if (win.performance.now() - lastInteraction < userOpenedWithinMs) {
      userOpened.add(overlay);
      return;
    }
    if (!isSmallForm(overlay) || !(asksForEmail(overlay) || offersSignup(overlay))) return;
    hide(overlay);
    const nearby = [...(overlay.parentElement?.children ?? []), ...doc.body.children];
    for (const el of nearby) if (el !== overlay && !hidden.has(el) && isBackdrop(el)) hide(el);
    if (scrollLocked()) doc.documentElement.setAttribute(unlockAttribute, owner);
  };

  const changed = new Set<Element>();
  const scan = () => {
    if (!doc.body) return;
    const candidates = new Set<Element>([
      ...doc.querySelectorAll(emailInputs),
      ...doc.querySelectorAll(dialogs),
      ...doc.body.children,
      ...[...changed].slice(0, maxTargetsPerScan),
    ]);
    changed.clear();
    const overlays = new Set<Element>();
    for (const el of candidates) {
      if (el.closest(`[${hiddenAttribute}]`)) continue;
      const overlay = overlayOf(el);
      if (overlay) overlays.add(overlay);
    }
    for (const overlay of overlays) check(overlay);
  };

  // Pop-ups are added later or shown by changing a class/style: re-check (throttled) on changes.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes') changed.add(record.target as Element);
      for (const node of record.addedNodes) if (node instanceof Element) changed.add(node);
    }
    timer ??= setTimeout(() => {
      timer = undefined;
      scan();
    }, 250);
  });
  observer.observe(doc.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'hidden', 'open'],
  });
  win.addEventListener('pointerdown', onPointer, true);
  win.addEventListener('keydown', onKey, true);
  scan();

  return () => {
    observer.disconnect();
    clearTimeout(timer);
    win.removeEventListener('pointerdown', onPointer, true);
    win.removeEventListener('keydown', onKey, true);
    for (const el of hidden) el.removeAttribute(hiddenAttribute);
    hidden.clear();
    doc.documentElement.removeAttribute(unlockAttribute);
    removeStyle();
  };
}
