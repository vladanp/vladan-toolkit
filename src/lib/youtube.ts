/** The video id of a watch page URL (youtube.com/watch?v=…), if it is one. */
export function watchPageVideoId(url: string): string | undefined {
  const { pathname, searchParams } = new URL(url);
  const id = searchParams.get('v');
  return pathname === '/watch' && id && /^[\w-]{11}$/.test(id) ? id : undefined;
}
