// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { looksLikeShop, startFlagging } from './detector';

afterEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('looksLikeShop', () => {
  it.each([
    ['a buy button', '<button>Add to cart</button>'],
    ['a booking link', '<a href="/r">See availability</a>'],
    ['a link named differently', '<a aria-label="Opens Hotel X information">See availability</a>'],
    ['product metadata', '<meta property="product:price:amount" content="9">'],
    ['JSON-LD', '<script type="application/ld+json">{"@type": "Product", "name": "Shoe"}</script>'],
  ])('recognizes %s', (_, html) => {
    document.body.innerHTML = html;
    expect(looksLikeShop(document)).toBe(true);
  });

  it('is false for a forum or news page', () => {
    document.body.innerHTML =
      '<article>Only 2 left to go!</article><button>Reply</button><a href="/">Home</a>';
    expect(looksLikeShop(document)).toBe(false);
  });
});

describe('startFlagging', () => {
  it('flags scarcity messages on shops and cleans up after itself', () => {
    document.body.innerHTML =
      '<p id="stock" title="Stock">Only 2 left</p><p id="viewers">9 people are viewing</p><button>Add to cart</button>';
    const stop = startFlagging();
    expect(document.getElementById('stock')?.dataset.vladanToolkitPressure).toBe('scarcity');
    expect(document.getElementById('viewers')?.getAttribute('title')).toMatch(/rush you/);

    stop();
    expect(document.querySelectorAll('[data-vladan-toolkit-pressure]')).toHaveLength(0);
    expect(document.getElementById('stock')?.getAttribute('title')).toBe('Stock'); // The site's own.
    expect(document.getElementById('viewers')?.hasAttribute('title')).toBe(false);
  });

  it('catches up when the buy buttons render late', () => {
    vi.useFakeTimers();
    try {
      document.body.innerHTML = '<p id="stock">We have 6 left at this price</p>';
      const stop = startFlagging();
      const stock = document.getElementById('stock');
      expect(stock?.hasAttribute('data-vladan-toolkit-pressure')).toBe(false);

      document.body.insertAdjacentHTML('beforeend', '<a href="/hotel">See availability</a>');
      vi.advanceTimersByTime(3000);
      expect(stock?.dataset.vladanToolkitPressure).toBe('scarcity');
      stop();
    } finally {
      vi.useRealTimers();
    }
  });

  it('leaves the same words alone on pages that sell nothing', () => {
    document.body.innerHTML = '<p id="comment">Only 2 left in my collection, lol</p>';
    const stop = startFlagging();
    expect(document.getElementById('comment')?.hasAttribute('data-vladan-toolkit-pressure')).toBe(
      false,
    );
    stop();
  });
});
