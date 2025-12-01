/**
 * BottomNav component
 * Bottom navigation bar
 */

import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

export interface BottomNavProps {
  activeTab?: 'feed' | 'saved' | 'add' | 'chats' | 'profile' | 'notifications';
}

export const BottomNav: FC<BottomNavProps> = ({ activeTab = 'feed' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (tab: string) => {
    if (tab === 'feed') return location.pathname === '/';
    if (tab === 'saved') return location.pathname === '/saved';
    if (tab === 'notifications') return location.pathname === '/notifications';
    if (tab === 'chats') return location.pathname === '/matches';
    if (tab === 'profile') return location.pathname === '/profile';
    return false;
  };

  return (
    <nav className={styles.bottomNav}>
      <button
        className={`${styles.navButton} ${isActive('feed') ? styles.navButtonActive : ''}`}
        onClick={() => navigate('/')}
        type="button"
        aria-label="Feed"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive('feed') ? 'currentColor' : 'none'}
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive('feed') ? 'currentColor' : 'none'}
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive('feed') ? 'currentColor' : 'none'}
          />
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${isActive('saved') ? styles.navButtonActive : ''}`}
        onClick={() => navigate('/saved')}
        type="button"
        aria-label="Saved"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive('saved') ? 'currentColor' : 'none'}
          />
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${styles.addButton}`}
        onClick={() => navigate('/add')}
        type="button"
        aria-label="Add"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${isActive('notifications') ? styles.navButtonActive : ''}`}
        onClick={() => navigate('/notifications')}
        type="button"
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 8A6 6 0 0 0 6 8C6 11.3137 3 14 3 17H21C21 14 18 11.3137 18 8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive('notifications') ? 'currentColor' : 'none'}
          />
          <path
            d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive('notifications') ? 'currentColor' : 'none'}
          />
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${isActive('chats') ? styles.navButtonActive : ''}`}
        onClick={() => navigate('/matches')}
        type="button"
        aria-label="Chats"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive('chats') ? 'currentColor' : 'none'}
          />
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${isActive('profile') ? styles.navButtonActive : ''}`}
        onClick={() => navigate('/profile')}
        type="button"
        aria-label="Profile"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </nav>
  );
};

