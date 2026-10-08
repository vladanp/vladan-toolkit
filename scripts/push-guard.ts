/** Pure decision logic for the pre-push hook (scripts/check-push.ts), kept separate for tests. */

export interface PushState {
  /** Git's pre-push stdin: one "<local ref> <local sha> <remote ref> <remote sha>" line per ref. */
  stdin: string;
  head: string;
  /** `git status --porcelain` output (untracked included, ignored excluded). */
  status: string;
  /** Files in the repo root. */
  rootFiles: string[];
}

export interface PushDecision {
  errors: string[];
  /** Whether the full `pnpm verify` must run (false when only tags/deletions are pushed). */
  verify: boolean;
}

/** Git-ignored env files WXT bakes into builds (`.env`, `.env.local`, `.env.production`, ...). */
const isBuildEnvFile = (name: string) =>
  /^\.env(\..+)?$/.test(name) && !/^\.env\.(submit|example)/.test(name);

export function decidePush({ stdin, head, status, rootFiles }: PushState): PushDecision {
  const refs = stdin
    .split('\n')
    .map((line) => line.trim().split(' '))
    .filter((parts): parts is [string, string, ...string[]] => parts.length >= 2);
  const updates = refs.filter(
    ([localRef, localSha]) => !/^0+$/.test(localSha) && !localRef.startsWith('refs/tags/'),
  );
  // Nothing recognizable on stdin: be safe and verify anyway.
  if (refs.length > 0 && updates.length === 0) return { errors: [], verify: false };

  const errors: string[] = [];
  if (status.trim()) {
    errors.push(
      `Uncommitted changes would be verified instead of your commits. Commit or stash:\n${status}`,
    );
  }
  for (const [localRef, localSha] of updates) {
    if (localSha !== head)
      errors.push(`${localRef} is not checked out. Check it out before pushing it.`);
  }
  const envFiles = rootFiles.filter(isBuildEnvFile);
  if (envFiles.length > 0) {
    errors.push(
      `${envFiles.join(', ')} would be baked into the local build but don't exist in CI. Move or delete them before pushing.`,
    );
  }
  return { errors, verify: true };
}
