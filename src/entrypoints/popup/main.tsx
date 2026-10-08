import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@/assets/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Popup root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
