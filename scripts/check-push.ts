// pre-push guard: `pnpm verify` tests the working tree, so the tree must be exactly what is pushed.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const dirty = git('status', '--porcelain');
if (dirty) {
  fail(`Uncommitted changes would be verified instead of your commits. Commit or stash:\n${dirty}`);
}

// Git passes one line per ref on stdin: <local ref> <local sha> <remote ref> <remote sha>
const head = git('rev-parse', 'HEAD');
for (const line of readFileSync(0, 'utf8').split('\n')) {
  const [localRef, localSha] = line.trim().split(' ');
  if (!localRef || !localSha || /^0+$/.test(localSha) || localRef.startsWith('refs/tags/'))
    continue;
  if (localSha !== head) fail(`${localRef} is not checked out. Check it out before pushing it.`);
}
