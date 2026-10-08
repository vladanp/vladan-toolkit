import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

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
    // Persistent dev profile so logins survive `pnpm dev` restarts. Git-ignored via `.wxt/`.
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
  },
});
