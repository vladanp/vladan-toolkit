import { FeatureToggles } from '@/components/FeatureToggles';
import { getVersionLabel } from '@/lib/version';

export default function App() {
  return (
    <main className="w-[22rem] p-3 font-sans">
      <header className="mb-2 flex items-center gap-2.5 px-1">
        <img src="/icon/48.png" alt="" className="size-7 rounded-lg shadow-sm" />
        <h1 className="text-base font-semibold tracking-tight">Vladan Toolkit</h1>
        <span
          data-testid="version"
          className="ml-auto rounded-full bg-neutral-200/70 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
        >
          {getVersionLabel(browser.runtime.getManifest().version)}
        </span>
      </header>
      <FeatureToggles compact />
      <button
        type="button"
        className="mt-2 w-full rounded-xl px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-600/10 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-blue-400 dark:hover:bg-blue-400/10"
        onClick={() => browser.runtime.openOptionsPage()}
      >
        All settings →
      </button>
    </main>
  );
}
