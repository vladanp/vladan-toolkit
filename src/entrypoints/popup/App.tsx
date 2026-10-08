import { FeatureToggles } from '@/components/FeatureToggles';
import { getVersionLabel } from '@/lib/version';

export default function App() {
  return (
    <main className="w-80 p-4 font-sans">
      <h1 className="text-lg font-semibold">Vladan Toolkit</h1>
      <FeatureToggles compact />
      <footer className="mt-2 flex items-center justify-between text-xs text-neutral-400">
        <button
          type="button"
          className="text-blue-600 hover:underline dark:text-blue-400"
          onClick={() => browser.runtime.openOptionsPage()}
        >
          All settings
        </button>
        <span data-testid="version">{getVersionLabel(browser.runtime.getManifest().version)}</span>
      </footer>
    </main>
  );
}
