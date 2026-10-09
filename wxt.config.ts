import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import { rulesets } from './src/features/rulesets';

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
    // Shown as the Web Store summary (max 132 chars).
    description:
      'Blocks pop-ups, cookie banners and link tracking; skips YouTube sponsors; hides Shorts; flags fake urgency. Switch each tweak off.',
    // Only what features need (see CLAUDE.md):
    // - storage: per-feature on/off settings
    // - scripting: cookie banners (autoconsent's built-in snippets for some consent pop-ups)
    // - declarativeNetRequestWithHostAccess: tracking parameters, AMP links (network rules)
    permissions: ['storage', 'scripting', 'declarativeNetRequestWithHostAccess'],
    // Cookie banners, pop-ups, tracking parameters and dark patterns are on every website.
    host_permissions: ['*://*/*'],
    // Disabled here; the background enables each ruleset while its feature's switch is on.
    declarative_net_request: {
      rule_resources: rulesets.map(({ id }) => ({ id, enabled: false, path: `rules/${id}.json` })),
    },
  },
  hooks: {
    'build:publicAssets': (_wxt, files) => {
      for (const { id, rules } of rulesets) {
        files.push({ relativeDest: `rules/${id}.json`, contents: JSON.stringify(rules) });
      }
    },
  },
  webExt: {
    chromiumProfile,
    keepProfileChanges: true,
  },
});
