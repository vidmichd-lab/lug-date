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

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('admin_token');
    // Only consider authenticated if token exists and is not empty
    const hasValidToken = !!token && token.trim().length > 0;

    // If no valid token, clear any invalid token
    if (!hasValidToken) {
      localStorage.removeItem('admin_token');
    }

    setIsAuthenticated(hasValidToken);
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
