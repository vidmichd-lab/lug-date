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
      <div className={styles.content}>
        <h2 className={styles.emptyTitle}>{t('feed.empty.title', 'На этом пока всё')}</h2>
        <div className={styles.emptySubtitle}>
          <p>
            {type === 'events'
              ? t('feed.empty.subtitleLine1', 'Вы посмотрели все события')
              : t('feed.empty.subtitleProfiles', 'Вы посмотрели все профили')}
          </p>
          {type === 'events' && <p>{t('feed.empty.subtitleLine2', 'своего города')}</p>}
        </div>
        <button className={styles.refreshButton} onClick={onRefresh} type="button">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4V10H10M20 20V14H14M14 20H20C18.8954 20 18 19.1046 18 18M10 4H4C5.10457 4 6 4.89543 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t('feed.empty.refresh', 'Обновить')}</span>
        </button>
      </div>
    </div>
  );
};
