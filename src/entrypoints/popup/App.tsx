import { getVersionLabel } from '@/lib/version';

export default function App() {
  return (
    <main className="w-72 p-4 font-sans">
      <h1 className="text-lg font-semibold">Vladan Toolkit</h1>
      <p className="mt-1 text-sm text-neutral-500">No features yet. Add the first one!</p>
      <p data-testid="version" className="mt-4 text-xs text-neutral-400">
        {getVersionLabel(browser.runtime.getManifest().version)}
      </p>
    </main>
  );
}
