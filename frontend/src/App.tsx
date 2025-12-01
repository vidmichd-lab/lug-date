import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, ProfilePage, MatchesPage } from './pages';
import { LoadingFallback } from './components/LoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initPerformanceMonitoring } from './utils/performance';

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
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ErrorBoundary>
                    <HomePage />
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
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

