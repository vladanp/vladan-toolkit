import { describe, expect, it, vi } from 'vitest';
import { fetchSegments, hashPrefix, type Segment, segmentToSkip } from './segments';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('hashPrefix', () => {
  it('is the first 4 hex characters of the SHA-256 of the video id', async () => {
    // sha256("dQw4w9WgXcQ") = 5f6b0b4e...
    expect(await hashPrefix('dQw4w9WgXcQ')).toBe('5f6b');
  });
});

describe('fetchSegments', () => {
  it('sends only the hash prefix and picks the requested video locally', async () => {
    const fetchFn = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      json([
        {
          videoID: 'otherVideo1',
          segments: [{ segment: [0, 50], category: 'sponsor', actionType: 'skip' }],
        },
        {
          videoID: 'dQw4w9WgXcQ',
          segments: [
            { segment: [90, 100], category: 'intro', actionType: 'skip', videoDuration: 212 },
            { segment: [10, 20], category: 'sponsor', actionType: 'skip', videoDuration: 212 },
            { segment: [30, 40], category: 'sponsor', actionType: 'mute' },
            { segment: [50, 60], category: 'music_offtopic', actionType: 'skip' },
            { segment: [70, 70], category: 'sponsor', actionType: 'skip' },
          ],
        },
      ]),
    );

    const segments = await fetchSegments('dQw4w9WgXcQ', fetchFn);

    const url = new URL(String(fetchFn.mock.calls[0]?.[0]));
    expect(fetchFn.mock.calls[0]?.[1]).toEqual({ credentials: 'omit' });
    expect(url.origin + url.pathname).toBe('https://sponsor.ajay.app/api/skipSegments/5f6b');
    expect(url.search).not.toContain('dQw4w9WgXcQ');
    expect(JSON.parse(url.searchParams.get('actionTypes') ?? '')).toEqual(['skip']);
    expect(segments).toEqual([
      { start: 10, end: 20, category: 'sponsor', videoDuration: 212 },
      { start: 90, end: 100, category: 'intro', videoDuration: 212 },
    ]);
  });

  it('treats 404 as "no segments" and other errors as failures', async () => {
    expect(await fetchSegments('dQw4w9WgXcQ', async () => json({}, 404))).toEqual([]);
    await expect(fetchSegments('dQw4w9WgXcQ', async () => json({}, 500))).rejects.toThrow('500');
  });
});

describe('segmentToSkip', () => {
  const sponsor: Segment = { start: 10, end: 20, category: 'sponsor', videoDuration: 300 };
  const intro: Segment = { start: 0, end: 5, category: 'intro', videoDuration: 0 };
  const segments = [intro, sponsor];
  const none = new Set<Segment>();

  it('finds the segment playback is in', () => {
    expect(segmentToSkip(segments, 2, 300, none)).toBe(intro);
    expect(segmentToSkip(segments, 10, 300, none)).toBe(sponsor);
    expect(segmentToSkip(segments, 7, 300, none)).toBeUndefined();
    expect(segmentToSkip(segments, 19.9, 300, none)).toBeUndefined(); // Already at its end.
  });

  it('respects segments the user chose to watch', () => {
    expect(segmentToSkip(segments, 12, 300, new Set([sponsor]))).toBeUndefined();
  });

  it('ignores segments submitted for a different version of the video', () => {
    expect(segmentToSkip(segments, 12, 250, none)).toBeUndefined();
    expect(segmentToSkip(segments, 12, 301.5, none)).toBe(sponsor);
    expect(segmentToSkip(segments, 12, Number.NaN, none)).toBe(sponsor); // Length not known yet.
    expect(segmentToSkip(segments, 2, 250, none)).toBe(intro); // Submitted length unknown.
  });
});
