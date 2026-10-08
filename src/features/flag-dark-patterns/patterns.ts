/** Scarcity and "everyone's buying it" messages (English). */
export const scarcityPatterns = [
  /\bonly\s+\d+\s+(?:items?\s+|pieces?\s+|units?\s+|seats?\s+|rooms?\s+)?(?:left|remaining|available)\b/i,
  /\b\d+\s+(?:items?\s+|pieces?\s+|units?\s+)?(?:left|remaining)\s+in\s+stock\b/i,
  /\b(?:low|limited)\s+stock\b/i,
  /\b(?:almost|nearly)\s+(?:gone|sold\s+out)\b/i,
  /\bselling\s+(?:out\s+)?fast\b/i,
  /\bin\s+high\s+demand\b/i,
  /\b\d+\s+(?:people|others|shoppers|customers|users|visitors)\s+(?:are\s+)?(?:viewing|looking\s+at|watching)\b/i,
  /\bin\s+\d+\s+(?:other\s+)?(?:people['’]s\s+|shoppers['’]\s+)?(?:carts|baskets|bags)\b/i,
  /\b\d+\s+(?:sold|bought|purchased|booked)\s+in\s+(?:the\s+)?(?:last|past)\s+\d+\s+(?:minutes?|hours?)\b/i,
  // Travel sites: "We have 6 left at this price", "Booked 12 times in the last 24 hours".
  /\b(?:we\s+have|there\s+(?:are|is))\s+(?:only\s+)?\d+\s+(?:\w+\s+)?left\b/i,
  /\b\d+\s+(?:\w+\s+){0,2}left\s+(?:at\s+this\s+price|on\s+our\s+site)\b/i,
  /\bbooked\s+\d+\s+times\s+in\s+the\s+(?:last|past)\b/i,
];

/** Cheap pre-check before running the patterns on a text. */
export const scarcityCue =
  /left|stock|gone|sold|fast|demand|viewing|looking|watching|carts?\b|baskets?\b|bags?\b|bought|purchased|booked/i;

/** Words that make a ticking timer a sales countdown (not a video or game clock). */
export const urgencyWords =
  /\b(?:ends?|ending|left|hurry|offer|sale|deals?|expires?|expiring|limited|discount|off|save|order\s+within|last\s+chance|flash|reserved|checkout|don['’]?t\s+miss)\b/i;

export const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

export const isScarcityMessage = (text: string) =>
  scarcityPatterns.some((pattern) => pattern.test(text));

/** The numbers in a clock's text, e.g. "02h : 14m : 33s" -> [2, 14, 33]. */
export const clockNumbers = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

/** Whether `next` reads as an earlier time than `previous` (same shape, lexicographically smaller). */
export function countsDown(previous: readonly number[], next: readonly number[]) {
  if (previous.length !== next.length || previous.length < 2) return false;
  for (let i = 0; i < next.length; i++) {
    if (next[i] !== previous[i]) return (next[i] ?? 0) < (previous[i] ?? 0);
  }
  return false;
}
