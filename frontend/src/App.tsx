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
import { initPerformanceMonitoring } from './utils/performance';
import { useOnboardingStore } from './stores';

function AppContent() {
  const { isCompleted } = useOnboardingStore();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {!isCompleted && (
          <Route
            path="/onboarding"
            element={
              <ErrorBoundary>
                <OnboardingPage />
              </ErrorBoundary>
            }
          />
        )}
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
              {!isCompleted ? <Navigate to="/onboarding" replace /> : <ProfilePage />}
            </ErrorBoundary>
          }
        />
        <Route
          path="/matches"
          element={
            <ErrorBoundary>
              {!isCompleted ? <Navigate to="/onboarding" replace /> : <MatchesPage />}
            </ErrorBoundary>
          }
        />
        <Route
          path="/saved"
          element={
            <ErrorBoundary>
              {!isCompleted ? <Navigate to="/onboarding" replace /> : <SavedEventsPage />}
            </ErrorBoundary>
          }
        />
        <Route
          path="/notifications"
          element={
            <ErrorBoundary>
              {!isCompleted ? <Navigate to="/onboarding" replace /> : <NotificationsPage />}
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
        <div className="app">
          <AppContent />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

