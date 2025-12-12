/**
 * Debug logger for admin
 * Uses fetch if available, falls back to console.log
 */

const LOG_SERVER = 'http://127.0.0.1:7242/ingest/fc744a59-a06c-4fb9-8d02-53af0df86fac';

interface LogEntry {
  location: string;
  message: string;
  data?: any;
  timestamp: number;
  sessionId: string;
  runId: string;
  hypothesisId?: string;
}

export function debugLog(entry: LogEntry): void {
  // Try fetch first (for browser)
  if (typeof fetch !== 'undefined') {
    fetch(LOG_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      // If fetch fails, log to console with special format for parsing
      console.log('[DEBUG_LOG]', JSON.stringify(entry));
    });
  } else {
    // Fallback to console
    console.log('[DEBUG_LOG]', JSON.stringify(entry));
  }
}
