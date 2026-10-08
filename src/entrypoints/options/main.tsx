import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FeatureToggles } from '@/components/FeatureToggles';
import '@/assets/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Options root element not found');

createRoot(root).render(
  <StrictMode>
    <main className="mx-auto max-w-xl p-8 font-sans">
      <h1 className="text-2xl font-semibold">Vladan Toolkit settings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Turn features on or off. Changes apply immediately, also on open tabs.
      </p>
      <FeatureToggles />
    </main>
  </StrictMode>,
);
