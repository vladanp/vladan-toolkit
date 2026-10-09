/**
 * The normal page for an AMP page (`<html amp>` or `<html ⚡>`), from its `<link rel="canonical">`.
 * Undefined for other pages, and when going there would come straight back here.
 */
export function originalPage(doc: Document = document): string | undefined {
  const html = doc.documentElement;
  if (!html.hasAttribute('amp') && !html.hasAttribute('⚡')) return undefined;
  const canonical = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  if (!canonical || !/^https?:/.test(canonical)) return undefined;
  const withoutHash = (url: string) => url.split('#')[0];
  const here = withoutHash(doc.URL);
  // A site that sends this browser back to its AMP page (e.g. as a phone) would otherwise loop:
  // after a redirect the referrer is this page, after a script redirect the normal page.
  // ponytail: a cross-site script redirect back (referrer trimmed to the origin) isn't caught.
  const from = withoutHash(doc.referrer);
  if ([here, from].includes(withoutHash(canonical)) || from === here) return undefined;
  return canonical;
}
