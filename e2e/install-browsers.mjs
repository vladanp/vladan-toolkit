import { execSync } from 'node:child_process';
import './browsers-path.mjs';

const withDeps = process.argv.includes('--with-deps') ? ' --with-deps' : '';
execSync(`playwright install chromium --no-shell${withDeps}`, { stdio: 'inherit' });
