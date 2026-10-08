// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { injectStyle } from './style';

const css = 'p { display: none !important; }';
const ours = (root: ParentNode) => root.querySelectorAll('style[data-vladan-toolkit="test"]');

describe('injectStyle', () => {
  it('adds a tagged stylesheet to the page and removes it on cleanup', () => {
    const remove = injectStyle(css, 'test');
    expect(ours(document)).toHaveLength(1);
    expect(ours(document)[0]?.textContent).toBe(css);

    remove();
    expect(ours(document)).toHaveLength(0);
  });

  it('can style inside an open shadow root', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });

    const remove = injectStyle(css, 'test', shadow);
    expect(ours(shadow)).toHaveLength(1);
    expect(ours(document)).toHaveLength(0);

    remove();
    expect(ours(shadow)).toHaveLength(0);
    host.remove();
  });
});
