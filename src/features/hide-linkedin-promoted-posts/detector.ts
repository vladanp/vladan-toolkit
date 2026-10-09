import { injectStyle } from '@/lib/style';
import { hideLinkedinPromotedPosts } from '.';

// Posts: the 2026 feed renders div[role=listitem]s with hashed classes; post pages and profile
// activity still use the classic markup. LinkedIn's class names change, its labels rarely do.
const postSelector =
  'div[role="listitem"], div[data-id^="urn:li:activity"], div.feed-shared-update-v2';
// A post's (or comment's) own text, where the same words are just prose.
const bodySelector =
  '[data-testid="expandable-text-box"], .feed-shared-update-v2__description, .update-components-text';
const sponsoredLink = '[aria-label="View Sponsored Content"]';
const labelSelector = `p, span, h2, ${sponsoredLink}`;

/**
 * Ad label, in LinkedIn's main languages: "Promoted", "Promoted by Acme", "Promoted • Partnership
 * with Acme". Not "Promoted to VP!" or an author called "Promoted Solutions".
 */
export const promotedLabel =
  /^(?:Promoted|Promocionado|Sponsorisé|Anzeige|Promosso|Patrocinado|プロモーション|推广)(?: by\b| •|$)/;
// ponytail: English only; add other languages' header text when seen.
export const suggestedLabel = /^(?:Suggested|Suggested for you|Recommended for you)$/;

const hiddenAttribute = 'data-vladan-toolkit-linkedin';
const css = `[${hiddenAttribute}] { display: none !important; }`;

/** Why the element's post should be hidden, if its leading text (or aria-label) is a label. */
function reason(el: Element): string | undefined {
  if (el.matches(sponsoredLink)) return 'promoted';
  if (el.closest(bodySelector)) return undefined;
  // The label leads its element; "Promoted by <a>Acme</a>" has the advertiser in child nodes.
  const lead = [...el.childNodes]
    .find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
    ?.textContent?.trim();
  if (!lead) return undefined;
  if (promotedLabel.test(lead)) return 'promoted';
  if (suggestedLabel.test(lead)) return 'suggested';
  return undefined;
}

function check(el: Element) {
  const post = el.closest(postSelector);
  if (!post || post.hasAttribute(hiddenAttribute)) return;
  const why = reason(el);
  if (why) post.setAttribute(hiddenAttribute, why);
}

function scan(root: Element) {
  if (root.matches(labelSelector)) check(root);
  for (const el of root.querySelectorAll(labelSelector)) check(el);
}

/** Hides promoted and suggested posts, also ones that load (or finish rendering) later. */
export function startHidingLinkedinPosts(doc: Document = document): () => void {
  const removeStyle = injectStyle(css, hideLinkedinPromotedPosts.id, doc);
  // Only what changed: the feed keeps growing as you scroll.
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        const el = node instanceof Element ? node : node.parentElement;
        if (el) scan(el);
      }
    }
  });
  observer.observe(doc, { childList: true, subtree: true });
  scan(doc.documentElement);

  return () => {
    observer.disconnect();
    removeStyle();
    for (const post of doc.querySelectorAll(`[${hiddenAttribute}]`)) {
      post.removeAttribute(hiddenAttribute);
    }
  };
}
