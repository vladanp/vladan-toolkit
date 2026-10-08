import { injectStyle } from '@/lib/style';
import { flagDarkPatterns } from '.';
import {
  clockNumbers,
  countsDown,
  isScarcityMessage,
  normalize,
  scarcityCue,
  urgencyWords,
} from './patterns';

const owner = flagDarkPatterns.id;
const attribute = 'data-vladan-toolkit-pressure';
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

interface ClockState {
  last: number[];
  ticksDown: number;
  ignored: boolean;
}

/**
 * Marks dark patterns: scarcity messages ("only 2 left", "12 people are viewing") and countdown
 * timers (text whose numbers tick down, next to words like "sale ends"). Returns the cleanup.
 */
export function startFlagging(doc: Document = document): () => void {
  const removeStyle = injectStyle(css, owner, doc);
  const flagged = new Map<Element, { addedTitle: boolean }>();
  const clocks = new WeakMap<Element, ClockState>();

  const isFlagged = (el: Element) => el.closest(`[${attribute}]`) !== null;

  const flag = (el: Element, kind: Kind) => {
    if (isFlagged(el) || el.closest(skipped)) return;
    el.setAttribute(attribute, kind);
    const addedTitle = !el.hasAttribute('title');
    if (addedTitle) el.setAttribute('title', labels[kind]);
    flagged.set(el, { addedTitle });
  };

  // Scarcity: the smallest element (up to 3 levels above the text) whose text is such a message.
  const checkText = (text: Text) => {
    if (!scarcityCue.test(text.data)) return;
    let el = text.parentElement;
    for (let level = 0; el && el !== doc.body && level < 4; level++, el = el.parentElement) {
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
        if (/\d/.test(target.textContent ?? '')) onTick(target);
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
    doc.removeEventListener('DOMContentLoaded', start);
    for (const [el, { addedTitle }] of flagged) {
      el.removeAttribute(attribute);
      if (addedTitle) el.removeAttribute('title');
    }
    flagged.clear();
    removeStyle();
  };
}
