/// <reference types="vite/client" />
/// <reference types="@twa-dev/types" />

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: import('@twa-dev/types').WebApp;
    };
    ym?: (counterId: number, method: string, target: string, params?: any) => void;
  }
}

export {};
