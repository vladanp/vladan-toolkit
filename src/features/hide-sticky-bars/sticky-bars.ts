import { injectStyle } from '@/lib/style';
import { hideStickyBars } from '.';

const owner = hideStickyBars.id;
const attribute = 'data-vladan-toolkit-sticky';
// `visibility` keeps the layout as it is (no jump when a sticky header leaves the flow); `opacity`
// also covers children that set `visibility: visible` themselves.
const css = `[${attribute}] { visibility: hidden !important; opacity: 0 !important; }`;

// Scrolled less than this (px): the page's top, where headers belong. Bars come back.
const topZone = 80;

/**
 * While the page is scrolled down, hides fixed/sticky bars along the top and bottom edges of the
 * window (wide and not too tall: headers, footers, banners; not sidebars or buttons). Only pages
 * that scroll as a whole are affected, which leaves web apps alone. Returns the cleanup.
 */
export function startHidingStickyBars(win: Window = window): () => void {
  const doc = win.document;
  const removeStyle = injectStyle(css, owner, doc);
  const hidden = new Set<Element>();

  /** The outermost fixed/sticky ancestor of the element showing at (x, y), if it's a bar. */
  const barAt = (x: number, y: number, edge: 'top' | 'bottom') => {
    let bar: Element | undefined;
    for (let el = doc.elementFromPoint(x, y); el && el !== doc.body; el = el.parentElement) {
      if (el === doc.documentElement) break;
      const { position } = win.getComputedStyle(el);
      if (position === 'fixed' || position === 'sticky') bar = el;
    }
    if (!bar || hidden.has(bar)) return undefined;
    const rect = bar.getBoundingClientRect();
    const atEdge = edge === 'top' ? rect.top <= 2 : rect.bottom >= win.innerHeight - 2;
    const isBar = rect.width >= win.innerWidth * 0.5 && rect.height <= win.innerHeight * 0.35;
    const inUse = doc.activeElement !== doc.body && bar.contains(doc.activeElement);
    const isDialog = bar.matches('dialog, [role="dialog"], [aria-modal="true"]');
    return atEdge && isBar && !inUse && !isDialog ? bar : undefined;
  };

  const hideBars = () => {
    // A hidden bar no longer catches the probes, so repeat to find bars stacked under it.
    for (let round = 0; round < 3; round++) {
      const found = new Set<Element>();
      for (const fraction of [0.25, 0.5, 0.75]) {
        const x = win.innerWidth * fraction;
        for (const bar of [barAt(x, 1, 'top'), barAt(x, win.innerHeight - 2, 'bottom')]) {
          if (bar) found.add(bar);
        }
      }
      if (found.size === 0) return;
      for (const bar of found) {
        bar.setAttribute(attribute, '');
        hidden.add(bar);
      }
    }
  };

  const showBars = () => {
    for (const bar of hidden) bar.removeAttribute(attribute);
    hidden.clear();
  };

  let frame = 0;
  const update = () => {
    frame = 0;
    if (win.scrollY < topZone) showBars();
    else hideBars();
  };
  const onScroll = () => {
    frame ||= win.requestAnimationFrame(update);
  };
  win.addEventListener('scroll', onScroll, { passive: true });
  update();

  return () => {
    win.removeEventListener('scroll', onScroll);
    win.cancelAnimationFrame(frame);
    showBars();
    removeStyle();
  };
}
