import { describe, expect, it } from 'vitest';
import { features } from './registry';

describe('feature registry', () => {
  it('has unique kebab-case ids (they are storage keys)', () => {
    const ids = features.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every feature a name and description for the settings UI', () => {
    for (const f of features) {
      expect(f.name.trim()).not.toBe('');
      expect(f.description.trim()).not.toBe('');
    }
  });
});
