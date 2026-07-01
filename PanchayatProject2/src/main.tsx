import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.js';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('✅ Service Worker registered'))
      .catch((err) => console.log('SW error:', err));
  });
}