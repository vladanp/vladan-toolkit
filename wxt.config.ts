import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// Persistent dev profile so logins survive `pnpm dev` restarts. Git-ignored via `.wxt/`.
// web-ext needs an absolute path that already exists, or it falls back to a throwaway temp profile.
const chromiumProfile = resolve('.wxt/chrome-data');
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
    // Add permissions only when a feature needs them (see CLAUDE.md).
    permissions: [],
  },
  webExt: {
    chromiumProfile,
    keepProfileChanges: true,
  },
});
