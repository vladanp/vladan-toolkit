import { describe, expect, it } from 'vitest';
import { getVersionLabel } from './version';

describe('getVersionLabel', () => {
  it('prefixes the version with v', () => {
    expect(getVersionLabel('1.2.3')).toBe('v1.2.3');
  });
});
