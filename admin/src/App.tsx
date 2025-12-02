import { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/UsersPage';
import { EventsPage } from './pages/EventsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import './App.css';
import styles from './App.module.css';

type Page = 'dashboard' | 'users' | 'events' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');

      // If no token, show login immediately
      if (!token || token.trim().length === 0) {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        console.log('🔍 No token found, showing login form');
        return;
      }

      // Token exists - verify it by making a test request
      // We'll let the first API call verify it, and if it fails,
      // the interceptor will clear the token and reload
      console.log('🔍 Token found, assuming authenticated. Will verify on first API call.');
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (token: string) => {
    if (token && token.trim().length > 0) {
      localStorage.setItem('admin_token', token);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    // Force reload to clear any cached state
    window.location.reload();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersPage />;
      case 'events':
        return <EventsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <h1 className={styles.logo}>Админ-панель</h1>
          <div className={styles.navLinks}>
            <button
              className={`${styles.navLink} ${currentPage === 'dashboard' ? styles.active : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Аналитика
            </button>
            <button
              className={`${styles.navLink} ${currentPage === 'users' ? styles.active : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              Пользователи
            </button>
            <button
              className={`${styles.navLink} ${currentPage === 'events' ? styles.active : ''}`}
              onClick={() => setCurrentPage('events')}
            >
              События
            </button>
            <button
              className={`${styles.navLink} ${currentPage === 'settings' ? styles.active : ''}`}
              onClick={() => setCurrentPage('settings')}
            >
              Настройки
            </button>
            <button
              className={styles.navLink}
              onClick={handleLogout}
              style={{ marginLeft: 'auto' }}
            >
              Выход
            </button>
          </div>
        </div>
      </nav>
      <main className={styles.main}>{renderPage()}</main>
    </div>
  );
}

export default App;
