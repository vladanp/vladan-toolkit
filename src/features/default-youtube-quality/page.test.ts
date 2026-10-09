import { describe, expect, it } from 'vitest';
import { pickQuality } from './page';

const upTo1080 = ['hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'auto'];

describe('pickQuality', () => {
  it('picks the preferred quality when the video has it', () => {
    expect(pickQuality(upTo1080, 'hd720')).toBe('hd720');
  });

  it('otherwise picks the best one below it', () => {
    expect(pickQuality(upTo1080, 'hd2160')).toBe('hd1080');
    expect(pickQuality(['hd720', 'medium', 'auto'], 'large')).toBe('medium');
  });

  it('"best" picks the best the video has, whatever the order', () => {
    expect(pickQuality(['auto', 'hd720', 'hd2160', 'hd1080'], 'best')).toBe('hd2160');
  });

  it('falls back to the lowest when everything is above the pick, and to nothing without qualities', () => {
    expect(pickQuality(['hd1080', 'hd720'], 'medium')).toBe('hd720');
    expect(pickQuality(['auto'], 'hd1080')).toBeUndefined();
  });
});
