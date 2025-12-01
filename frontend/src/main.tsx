import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';
import './i18n/config'; // Initialize i18n
import { initErrorMonitoring } from './monitoring';
import { initMetrica } from './utils/metrica';
import { queryClient } from './lib/queryClient';

// Initialize error monitoring (Yandex AppMetrica)
initErrorMonitoring();

// Initialize Yandex Metrica
initMetrica();

// Load Eruda for debugging in development mode only
if (import.meta.env.DEV) {
  import('eruda').then((eruda) => {
    eruda.default.init();
    console.log('🔧 Eruda debugger loaded');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);

