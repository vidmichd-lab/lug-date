import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/UsersPage';
import { EventsPage } from './pages/EventsPage';
import { SettingsPage } from './pages/SettingsPage';
import './App.css';
import styles from './App.module.css';

type Page = 'dashboard' | 'users' | 'events' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
          </div>
        </div>
      </nav>
      <main className={styles.main}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
