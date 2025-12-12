import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';
import './design-system/tokens/tokens.css'; // Design system CSS variables
import './i18n/config'; // Initialize i18n
import { initErrorMonitoring } from './monitoring';
import { initMetrica } from './utils/metrica';
import { queryClient } from './lib/queryClient';
import { debugLog } from './utils/debugLogger';

// #region agent log
debugLog({
  location: 'main.tsx:15',
  message: 'Frontend initialization started',
  data: {
    env: import.meta.env.MODE,
    hasTelegram: typeof window !== 'undefined' && !!window.Telegram,
  },
  timestamp: Date.now(),
  sessionId: 'debug-session',
  runId: 'run1',
  hypothesisId: 'A',
});
// #endregion

// Initialize error monitoring (Yandex AppMetrica)
try {
  initErrorMonitoring();
  // #region agent log
  debugLog({
    location: 'main.tsx:32',
    message: 'Error monitoring initialized',
    data: { success: true },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  });
  // #endregion
} catch (error) {
  // #region agent log
  debugLog({
    location: 'main.tsx:42',
    message: 'Error monitoring failed',
    data: { errorMessage: error instanceof Error ? error.message : String(error) },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  });
  // #endregion
}

// Initialize Yandex Metrica
try {
  initMetrica();
  // #region agent log
  debugLog({
    location: 'main.tsx:65',
    message: 'Metrica initialized',
    data: { success: true },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  });
  // #endregion
} catch (error) {
  // #region agent log
  debugLog({
    location: 'main.tsx:75',
    message: 'Metrica initialization failed',
    data: { errorMessage: error instanceof Error ? error.message : String(error) },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  });
  // #endregion
}

// Load Eruda for debugging in development mode only
if (import.meta.env.DEV) {
  import('eruda')
    .then((eruda) => {
      eruda.default.init();
      console.log('🔧 Eruda debugger loaded');
      // #region agent log
      debugLog({
        location: 'main.tsx:107',
        message: 'Eruda loaded',
        data: { success: true },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      });
      // #endregion
    })
    .catch((error) => {
      // #region agent log
      debugLog({
        location: 'main.tsx:117',
        message: 'Eruda load failed',
        data: { errorMessage: error instanceof Error ? error.message : String(error) },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      });
      // #endregion
    });
}

// #region agent log
debugLog({
  location: 'main.tsx:142',
  message: 'Before React render',
  data: {
    hasRootElement: !!document.getElementById('root'),
    hasQueryClient: !!queryClient,
  },
  timestamp: Date.now(),
  sessionId: 'debug-session',
  runId: 'run1',
  hypothesisId: 'B',
});
// #endregion

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </React.StrictMode>
  );
  // #region agent log
  debugLog({
    location: 'main.tsx:162',
    message: 'React render successful',
    data: { success: true },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'B',
  });
  // #endregion
} catch (error) {
  // #region agent log
  debugLog({
    location: 'main.tsx:172',
    message: 'React render failed',
    data: { errorMessage: error instanceof Error ? error.message : String(error) },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'B',
  });
  // #endregion
  throw error;
}

// Deployment trigger
// Trigger deployment Tue Dec  2 14:50:29 MSK 2025
