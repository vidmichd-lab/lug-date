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
    // Initialize Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    // Initialize performance monitoring
    initPerformanceMonitoring();
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

