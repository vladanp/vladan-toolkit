import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FeatureToggles } from '@/components/FeatureToggles';
import '@/assets/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Options root element not found');

createRoot(root).render(
  <StrictMode>
    <main className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <header className="mb-8 flex items-center gap-4">
        <img src="/icon/96.png" alt="" className="size-12 rounded-2xl shadow-sm" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vladan Toolkit settings</h1>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            Turn features on or off. Changes apply immediately, also on open tabs.
          </p>
        </div>
      </header>
      <FeatureToggles />
    </main>
  </StrictMode>,
);
