import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  HomePage,
  ProfilePage,
  MatchesPage,
  OnboardingPage,
  RegistrationPage,
  SavedEventsPage,
  NotificationsPage,
} from './pages';
import { LoadingFallback } from './components/LoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RegistrationGuard } from './components/RegistrationGuard';
import { initPerformanceMonitoring } from './utils/performance';
import { useOnboardingStore } from './stores';
import { debugLog } from './utils/debugLogger';

function AppContent() {
  const { isCompleted } = useOnboardingStore();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/onboarding"
          element={
            <ErrorBoundary>
              <OnboardingPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/registration"
          element={
            <ErrorBoundary>
              <RegistrationPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/"
          element={
            <ErrorBoundary>
              {!isCompleted ? <Navigate to="/onboarding" replace /> : <HomePage />}
            </ErrorBoundary>
          }
        />
        <Route
          path="/profile"
          element={
            <ErrorBoundary>
              <ProfilePage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/matches"
          element={
            <ErrorBoundary>
              <MatchesPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/saved"
          element={
            <ErrorBoundary>
              <SavedEventsPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/notifications"
          element={
            <ErrorBoundary>
              <NotificationsPage />
            </ErrorBoundary>
          }
        />
      </Routes>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    // #region agent log
    debugLog({
      location: 'App.tsx:87',
      message: 'App useEffect started',
      data: {
        hasTelegram: typeof window !== 'undefined' && !!window.Telegram,
        hasWebApp: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'C',
    });
    // #endregion

    // Initialize Telegram Web App
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        // #region agent log
        debugLog({
          location: 'App.tsx:110',
          message: 'Telegram WebApp initialized',
          data: {
            hasInitData: !!window.Telegram.WebApp.initData,
            initDataLength: window.Telegram.WebApp.initData?.length || 0,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'C',
        });
        // #endregion
      } catch (error) {
        // #region agent log
        debugLog({
          location: 'App.tsx:125',
          message: 'Telegram WebApp init failed',
          data: { errorMessage: error instanceof Error ? error.message : String(error) },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'C',
        });
        // #endregion
      }
    } else {
      // #region agent log
      debugLog({
        location: 'App.tsx:137',
        message: 'Telegram WebApp not available',
        data: { hasWindow: typeof window !== 'undefined' },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      });
      // #endregion
    }

    // Initialize performance monitoring
    try {
      initPerformanceMonitoring();
      // #region agent log
      debugLog({
        location: 'App.tsx:152',
        message: 'Performance monitoring initialized',
        data: { success: true },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      });
      // #endregion
    } catch (error) {
      // #region agent log
      debugLog({
        location: 'App.tsx:164',
        message: 'Performance monitoring failed',
        data: { errorMessage: error instanceof Error ? error.message : String(error) },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      });
      // #endregion
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RegistrationGuard>
          <div className="app">
            <AppContent />
          </div>
        </RegistrationGuard>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
