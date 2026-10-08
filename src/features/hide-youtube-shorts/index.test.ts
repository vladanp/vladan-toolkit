// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { hideYoutubeShorts, injectHideShortsStyle } from '.';

const ourStyles = () =>
  document.querySelectorAll(`style[data-vladan-toolkit="${hideYoutubeShorts.id}"]`);

describe('injectHideShortsStyle', () => {
  it('adds the hiding stylesheet and removes it on cleanup', () => {
    const remove = injectHideShortsStyle();
    expect(ourStyles()).toHaveLength(1);
    expect(ourStyles()[0]?.textContent).toContain('display: none !important');

    remove();
    expect(ourStyles()).toHaveLength(0);
  });
});
