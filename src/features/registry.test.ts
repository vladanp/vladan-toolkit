import { describe, expect, it } from 'vitest';
import { featureGroups } from '@/lib/features';
import { features } from './registry';
import { rulesets } from './rulesets';

describe('feature registry', () => {
  it('has unique kebab-case ids (they are storage keys)', () => {
    const ids = features.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every feature a name, description and settings group', () => {
    for (const f of features) {
      expect(f.name.trim()).not.toBe('');
      expect(f.description.trim()).not.toBe('');
      expect(featureGroups).toContain(f.group);
    }
  });

  it('switches every network ruleset with a registered feature of the same id', () => {
    const ids = rulesets.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(features.map((f) => f.id)).toContain(id);
  });

  it('gives every ruleset unique positive rule ids', () => {
    for (const { id, rules } of rulesets) {
      const ruleIds = rules.map((r) => r.id);
      expect(new Set(ruleIds).size, id).toBe(ruleIds.length);
      for (const ruleId of ruleIds) expect(Number.isInteger(ruleId) && ruleId > 0, id).toBe(true);
    }
  });
});
