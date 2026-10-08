import { injectStyle } from '@/lib/style';
import { flagDarkPatterns } from '.';
import {
  buyAction,
  clockNumbers,
  countsDown,
  isScarcityMessage,
  normalize,
  productSchema,
  scarcityCue,
  urgencyWords,
} from './patterns';

const owner = flagDarkPatterns.id;
const attribute = 'data-vladan-toolkit-pressure';
const titleAttribute = 'data-vladan-toolkit-title'; // Marks titles we added (removed on cleanup).
const css = `
[${attribute}] {
  outline: 2px dashed #f59e0b !important;
  outline-offset: 2px !important;
  filter: grayscale(1) !important;
  opacity: 0.5 !important;
}
`;
const labels = {
  countdown: 'Vladan Toolkit: countdown timer, a common way to rush you',
  scarcity: 'Vladan Toolkit: stock or popularity message, a common way to rush you',
};
type Kind = keyof typeof labels;

const skipped = 'script, style, noscript, textarea, input, select, [contenteditable]';
// Timers are a few small elements; bigger mutated containers (feeds, grids) aren't worth reading.
const maxClockChildren = 8;
// How often a page that didn't look like a shop is checked again (single-page apps navigate).
const shopRecheckMs = 3000;

interface ClockState {
  last: number[];
  ticksDown: number;
  ignored: boolean;
}

/** Whether the page sells something: product/offer metadata, or buy/book buttons. */
export function looksLikeShop(doc: Document): boolean {
  if (
    doc.querySelector(
      'meta[property^="product:"], meta[property="og:type"][content*="product" i], [itemtype*="schema.org/Product"], [itemtype*="schema.org/Offer"]',
    )
  ) {
    return true;
  }
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    if (productSchema.test(script.textContent ?? '')) return true;
  }
  for (const el of doc.querySelectorAll('button, a, input[type="submit"], [role="button"]')) {
    // Visible text and accessible name can differ ("See availability" / "Opens Hotel X information").
    for (const label of [
      el.textContent,
      el.getAttribute('aria-label'),
      (el as HTMLInputElement).value,
    ]) {
      if (label && label.length < 60 && buyAction.test(label)) return true;
    }
  }
  return false;
}

/**
 * Marks dark patterns on shopping pages: scarcity messages ("only 2 left", "12 people are viewing")
 * and countdown timers (text whose numbers tick down, next to words like "sale ends").
 * Returns the cleanup.
 */
export function startFlagging(doc: Document = document): () => void {
  const removeStyle = injectStyle(css, owner, doc);
  const clocks = new WeakMap<Element, ClockState>();

  // Whether this is a shop, decided when the first candidate shows up. Shops often render their buy
  // buttons late (or navigate to a product without reloading), so a "no" is checked again later,
  // and the page rescanned once it turns into a "yes".
  let shop: boolean | undefined;
  let shopTimer: ReturnType<typeof setTimeout> | undefined;
  const isShop = () => {
    shop ??= looksLikeShop(doc);
    if (!shop) {
      shopTimer ??= setTimeout(() => {
        shopTimer = undefined;
        shop = looksLikeShop(doc);
        if (shop) scanTree(doc.body);
      }, shopRecheckMs);
    }
    return shop;
  };

  const isFlagged = (el: Element) => el.closest(`[${attribute}]`) !== null;

  const flag = (el: Element, kind: Kind) => {
    if (isFlagged(el) || el.closest(skipped) || !isShop()) return;
    el.setAttribute(attribute, kind);
    if (!el.hasAttribute('title')) {
      el.setAttribute('title', labels[kind]);
      el.setAttribute(titleAttribute, '');
    }
  };

  // Scarcity: the smallest element (up to 3 levels above the text) whose text is such a message.
  const checkText = (text: Text) => {
    if (text.data.length > 160 || !scarcityCue.test(text.data)) return;
    let el = text.parentElement;
    for (let level = 0; el && el !== doc.body && level < 4; level++, el = el.parentElement) {
      if (el.childElementCount > 20) return; // A container, not a message.
      const content = normalize(el.textContent ?? '');
      if (content.length > 160) return;
      if (isScarcityMessage(content)) {
        flag(el, 'scarcity');
        return;
      }
    }
  };
  const scanTree = (root: Node) => {
    if (root.nodeType === Node.TEXT_NODE) return checkText(root as Text);
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) checkText(node as Text);
  };

  // Countdowns: the clock is the highest short ancestor holding the changing numbers.
  const clockOf = (el: Element) => {
    let clock: Element | undefined;
    for (
      let node: Element | null = el, level = 0;
      node && node !== doc.body && level < 4;
      level++
    ) {
      if (node.childElementCount > maxClockChildren) break;
      const content = normalize(node.textContent ?? '');
      if (content.length > 40) break;
      if (clockNumbers(content).length >= 2) clock = node;
      node = node.parentElement;
    }
    return clock;
  };
  const onTick = (el: Element) => {
    const clock = clockOf(el);
    if (!clock || isFlagged(clock)) return;
    const numbers = clockNumbers(clock.textContent ?? '');
    const state = clocks.get(clock);
    if (!state) {
      clocks.set(clock, { last: numbers, ticksDown: 0, ignored: false });
      return;
    }
    if (state.ignored) return;
    if (countsDown(state.last, numbers)) state.ticksDown++;
    else if (numbers.join() !== state.last.join()) state.ignored = true; // Counts up: a clock.
    state.last = numbers;
    if (state.ticksDown < 2) return;
    // Flag it together with its label ("Sale ends in"), if a sales word is close by.
    let widget: Element | null = clock;
    for (let level = 0; widget && widget !== doc.body && level < 4; level++) {
      if (widget.childElementCount > 20) break;
      const content = normalize(widget.textContent ?? '');
      if (content.length > 200) break;
      if (urgencyWords.test(content)) {
        flag(widget, 'countdown');
        return;
      }
      widget = widget.parentElement;
    }
    state.ignored = true; // No sales context: a game clock, video time, etc.
  };

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') {
        const parent = record.target.parentElement;
        if (parent) onTick(parent);
        checkText(record.target as Text);
      } else {
        const target = record.target as Element;
        if (target.childElementCount <= maxClockChildren) onTick(target);
        for (const node of record.addedNodes) scanTree(node);
      }
    }
  });
  const start = () => {
    observer.observe(doc.body, { subtree: true, childList: true, characterData: true });
    scanTree(doc.body);
  };
  if (doc.body) start();
  else doc.addEventListener('DOMContentLoaded', start, { once: true });

  return () => {
    observer.disconnect();
    clearTimeout(shopTimer);
    doc.removeEventListener('DOMContentLoaded', start);
    for (const el of doc.querySelectorAll(`[${attribute}]`)) {
      el.removeAttribute(attribute);
      if (el.hasAttribute(titleAttribute)) {
        el.removeAttribute('title');
        el.removeAttribute(titleAttribute);
      }
    }
    removeStyle();
  };
}
