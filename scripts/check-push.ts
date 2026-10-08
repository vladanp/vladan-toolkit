// pre-push hook: verify exactly what is being pushed (see scripts/push-guard.ts for the rules).
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { decidePush } from './push-guard.ts';

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();

const { errors, verify } = decidePush({
  stdin: readFileSync(0, 'utf8'),
  head: git('rev-parse', 'HEAD'),
  status: git('status', '--porcelain'),
  rootFiles: readdirSync('.'),
});

if (errors.length > 0) {
  for (const error of errors) console.error(`\n✖ ${error}`);
  process.exit(1);
}
if (!verify) {
  console.log('Only tags/deletions pushed: skipping verify.');
  process.exit(0);
}

const result = spawnSync('pnpm verify', { stdio: 'inherit', shell: true });
process.exit(result.status ?? 1);
