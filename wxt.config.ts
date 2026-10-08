import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// Persistent dev profile so logins survive `pnpm dev` restarts (git-ignored; outside `.wxt/`, which
// `wxt clean` wipes). web-ext needs an absolute path that already exists, or it uses a temp profile.
const chromiumProfile = resolve('.chrome-dev-profile');
mkdirSync(chromiumProfile, { recursive: true });

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  publicDir: 'public',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Vladan Toolkit',
    description: 'A personal Chrome toolkit that grows one feature at a time.',
    // Only what features need (see CLAUDE.md). `storage`: per-feature on/off settings.
    permissions: ['storage'],
  },
  webExt: {
    chromiumProfile,
    keepProfileChanges: true,
  },
});
