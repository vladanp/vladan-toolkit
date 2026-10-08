import { describe, expect, it } from 'vitest';
import { clockNumbers, countsDown, isScarcityMessage, urgencyWords } from './patterns';

describe('isScarcityMessage', () => {
  it.each([
    'Only 2 left!',
    'Hurry, only 3 items left in stock',
    '5 left in stock',
    'Low stock',
    'Almost gone',
    'Selling fast',
    'In high demand',
    '12 people are viewing this right now',
    'In 8 other people’s carts',
    '41 sold in the last 24 hours',
    'Only 1 room left at this price',
    'We have 6 left at this price',
    '3 rooms left at this price on our site',
    'Booked 12 times in the last 24 hours',
  ])('flags "%s"', (text) => expect(isScarcityMessage(text)).toBe(true));

  it.each([
    'In stock',
    'Free delivery on orders over $50',
    'Add to cart',
    'Left sidebar',
    '2 colors available',
    'Viewing 1-24 of 300 results',
    'Ships in 2 days',
  ])('leaves "%s" alone', (text) => expect(isScarcityMessage(text)).toBe(false));
});

describe('countdown helpers', () => {
  it('reads the numbers of a clock', () => {
    expect(clockNumbers('02h : 14m : 33s')).toEqual([2, 14, 33]);
  });

  it('knows a countdown from a clock counting up', () => {
    expect(countsDown([2, 14, 33], [2, 14, 32])).toBe(true);
    expect(countsDown([2, 15, 0], [2, 14, 59])).toBe(true);
    expect(countsDown([2, 14, 32], [2, 14, 33])).toBe(false);
    expect(countsDown([2, 14], [2, 14, 33])).toBe(false);
    expect(countsDown([5], [4])).toBe(false); // A single number isn't a clock.
  });

  it('needs a sales context', () => {
    expect(urgencyWords.test('Sale ends in')).toBe(true);
    expect(urgencyWords.test('Your cart is reserved for')).toBe(true);
    expect(urgencyWords.test('Half time')).toBe(false);
  });
});
