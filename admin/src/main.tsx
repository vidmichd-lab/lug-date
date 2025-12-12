import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { debugLog } from './utils/debugLogger';

// #region agent log
debugLog({
  location: 'admin/main.tsx:7',
  message: 'Admin app initialization',
  data: { hasRootElement: !!document.getElementById('root') },
  timestamp: Date.now(),
  sessionId: 'debug-session',
  runId: 'run1',
  hypothesisId: 'J',
});
// #endregion

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // #region agent log
  debugLog({
    location: 'admin/main.tsx:19',
    message: 'Admin app rendered',
    data: { success: true },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'J',
  });
  // #endregion
} catch (error) {
  // #region agent log
  debugLog({
    location: 'admin/main.tsx:31',
    message: 'Admin app render failed',
    data: { errorMessage: error instanceof Error ? error.message : String(error) },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'J',
  });
  // #endregion
  throw error;
}
