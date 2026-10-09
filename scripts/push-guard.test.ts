import { describe, expect, it } from 'vitest';
import { decidePush, type PushState } from './push-guard';

const head = 'a'.repeat(40);
const other = 'b'.repeat(40);
const zero = '0'.repeat(40);
const line = (localRef: string, sha: string) => `${localRef} ${sha} refs/heads/main ${other}`;
const clean: PushState = { stdin: line('refs/heads/main', head), head, status: '', rootFiles: [] };

describe('decidePush', () => {
  it('verifies a clean push of the checked out branch', () => {
    expect(decidePush(clean)).toEqual({ errors: [], verify: true });
  });

  it('allows a push via HEAD:branch (compares commits, not names)', () => {
    expect(decidePush({ ...clean, stdin: line('HEAD', head) })).toEqual({
      errors: [],
      verify: true,
    });
  });

  it('rejects uncommitted or untracked files', () => {
    expect(decidePush({ ...clean, status: '?? stray.txt' }).errors[0]).toContain('stray.txt');
  });

  it('rejects pushing a branch that is not checked out', () => {
    const { errors } = decidePush({ ...clean, stdin: line('refs/heads/other', other) });
    expect(errors[0]).toContain('refs/heads/other is not checked out');
  });

  it('rejects env files WXT would bake into the build, but not .env.submit/.env.example', () => {
    const rootFiles = [
      '.env',
      '.env.production.local',
      '.env.submit',
      '.env.example',
      'package.json',
    ];
    const { errors } = decidePush({ ...clean, rootFiles });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('.env, .env.production.local would be baked');
  });

  it('skips verify for tag only pushes and deletions', () => {
    expect(
      decidePush({ ...clean, stdin: line('refs/tags/v1.0.0', other), status: '?? x' }),
    ).toEqual({
      errors: [],
      verify: false,
    });
    expect(decidePush({ ...clean, stdin: line('(delete)', zero) })).toEqual({
      errors: [],
      verify: false,
    });
  });

  it('fails safe on empty stdin (verifies)', () => {
    expect(decidePush({ ...clean, stdin: '' })).toEqual({ errors: [], verify: true });
  });
});
