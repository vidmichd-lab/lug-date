/**
 * EmptyState component
 * Shown when no more cards are available
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  type: 'events' | 'profiles';
  onRefresh: () => void;
}

export const EmptyState: FC<EmptyStateProps> = ({ type, onRefresh }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyState}>
      <h2 className={styles.emptyTitle}>{t('feed.empty.title')}</h2>
      <p className={styles.emptySubtitle}>
        {type === 'events' ? t('feed.empty.subtitleEvents') : t('feed.empty.subtitleProfiles')}
      </p>
      <button className={styles.refreshButton} onClick={onRefresh} type="button">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
            fill="currentColor"
          />
        </svg>
        <span>{t('feed.empty.refresh')}</span>
      </button>
    </div>
  );
};
