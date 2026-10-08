// SponsorBlock (https://sponsor.ajay.app, data CC BY-NC-SA 4.0): crowd-sourced segments of YouTube videos.
const api = 'https://sponsor.ajay.app/api/skipSegments/';

/** SponsorBlock categories that get skipped, with the label shown after skipping. */
export const skippedCategories = {
  sponsor: 'sponsor',
  selfpromo: 'self-promotion',
  interaction: 'subscribe reminder',
  intro: 'intro',
} as const;
export type Category = keyof typeof skippedCategories;

export interface Segment {
  start: number;
  end: number;
  category: Category;
  /** Length of the video the segment was submitted for, in seconds (0 = unknown). */
  videoDuration: number;
}

interface ApiVideo {
  videoID: string;
  segments: {
    segment: [number, number];
    category: string;
    actionType: string;
    videoDuration?: number;
  }[];
}

/** Hex SHA-256 prefix of a video id: the only thing sent to SponsorBlock (k-anonymity). */
export async function hashPrefix(videoId: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(videoId));
  return [...new Uint8Array(hash, 0, 2)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Looks up the skippable segments of a video, sorted by start time. The API answers for every video
 * sharing the hash prefix; the requested one is picked locally.
 */
export async function fetchSegments(videoId: string, fetchFn = fetch): Promise<Segment[]> {
  const query = new URLSearchParams({
    categories: JSON.stringify(Object.keys(skippedCategories)),
    actionTypes: JSON.stringify(['skip']),
  });
  const response = await fetchFn(`${api}${await hashPrefix(videoId)}?${query}`, {
    credentials: 'omit',
  });
  if (response.status === 404) return []; // No segments for any video with this prefix.
  if (!response.ok) throw new Error(`SponsorBlock responded ${response.status}`);
  const videos = (await response.json()) as ApiVideo[];
  return (videos.find((video) => video.videoID === videoId)?.segments ?? [])
    .filter((s) => s.actionType === 'skip' && Object.hasOwn(skippedCategories, s.category))
    .map((s) => ({
      start: s.segment[0],
      end: s.segment[1],
      category: s.category as Category,
      videoDuration: s.videoDuration ?? 0,
    }))
    .filter((s) => s.end > s.start)
    .sort((a, b) => a.start - b.start);
}

// A re-uploaded or edited video has a different length; its old segments would skip the wrong parts.
const durationTolerance = 2;
// Don't skip in the last moment of a segment (the jump would be pointless).
const endMargin = 0.2;

/** The segment playback at `time` is in and should skip, if any. */
export function segmentToSkip(
  segments: readonly Segment[],
  time: number,
  duration: number,
  allowed: ReadonlySet<Segment>,
): Segment | undefined {
  return segments.find(
    (s) =>
      !allowed.has(s) &&
      time >= s.start &&
      time < s.end - endMargin &&
      (!s.videoDuration ||
        !Number.isFinite(duration) ||
        Math.abs(s.videoDuration - duration) <= durationTolerance),
  );
}
