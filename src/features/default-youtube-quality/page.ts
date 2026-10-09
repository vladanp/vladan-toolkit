// Runs in the page's own JavaScript world (no imports): YouTube's player API is only visible there.

/** Attribute on <html> holding the picked quality while the feature is on (set by the isolated world). */
export const qualityAttribute = 'data-vladan-toolkit-quality';

/** YouTube's quality names, best first. */
const ranked = [
  'highres',
  'hd2880',
  'hd2160',
  'hd1440',
  'hd1080',
  'hd720',
  'large',
  'medium',
  'small',
  'tiny',
];

/** The best of the video's qualities that isn't above `preferred` ("best": the best it has). */
export function pickQuality(available: readonly string[], preferred: string): string | undefined {
  const levels = available
    .filter((quality) => ranked.includes(quality))
    .sort((a, b) => ranked.indexOf(a) - ranked.indexOf(b));
  const cap = ranked.indexOf(preferred);
  return levels.find((quality) => ranked.indexOf(quality) >= cap) ?? levels.at(-1);
}

/** The bit of YouTube's player API (methods on the #movie_player element) this uses. */
interface Player extends HTMLElement {
  getAvailableQualityLevels?(): string[];
  setPlaybackQualityRange?(min: string, max: string): void;
}

/**
 * Page world: puts the main player in the picked quality whenever a video loads, and when the pick
 * changes. Does nothing while the attribute is missing (feature off).
 */
export function keepPickedQuality(doc: Document = document) {
  const apply = (player: Player | null) => {
    const preferred = doc.documentElement.getAttribute(qualityAttribute);
    const available = player?.getAvailableQualityLevels?.();
    if (!preferred || !available) return;
    const quality = pickQuality(available, preferred);
    if (quality) player?.setPlaybackQualityRange?.(quality, quality);
  };
  // Every video (also after in page navigation) loads into the same <video>. Media events don't bubble.
  doc.addEventListener(
    'loadedmetadata',
    (event) => {
      if (event.target instanceof HTMLVideoElement) apply(event.target.closest('#movie_player'));
    },
    true,
  );
  // A new pick (or the switch turned on) also applies to the video that is already playing.
  new MutationObserver(() => apply(doc.querySelector('#movie_player'))).observe(
    doc.documentElement,
    { attributeFilter: [qualityAttribute] },
  );
}
