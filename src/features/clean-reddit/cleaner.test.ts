// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { startCleaning } from './cleaner';

const ours = (root: ParentNode) =>
  root.querySelectorAll('style[data-vladan-toolkit="clean-reddit"]');
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe('startCleaning', () => {
  it('styles the page and every search box shadow root, also ones added later', async () => {
    const early = document.createElement('reddit-search-large');
    early.attachShadow({ mode: 'open' });
    document.body.append(early);

    const stop = startCleaning();
    expect(ours(document)).toHaveLength(1);
    expect(ours(early.shadowRoot as ShadowRoot)).toHaveLength(1);

    const late = document.createElement('reddit-search-large');
    late.attachShadow({ mode: 'open' });
    document.body.append(late);
    await nextFrame();
    await nextFrame();
    expect(ours(late.shadowRoot as ShadowRoot)).toHaveLength(1);
    expect(ours(early.shadowRoot as ShadowRoot)).toHaveLength(1); // Not added twice.

    stop();
    expect(ours(document)).toHaveLength(0);
    expect(ours(early.shadowRoot as ShadowRoot)).toHaveLength(0);
    expect(ours(late.shadowRoot as ShadowRoot)).toHaveLength(0);
    early.remove();
    late.remove();
  });
});
