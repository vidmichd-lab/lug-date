/**
 * FeedHeader component
 * Header with tab switcher and filter button
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FeedHeader.module.css';
import type { FeedHeaderProps } from './FeedHeader.types';

export const FeedHeader: FC<FeedHeaderProps> = ({
  activeTab,
  onTabChange,
  onFilterClick,
  hasActiveFilters,
}) => {
  const { t } = useTranslation();

  return (
    <header className={styles.mainHeader}>
      <div className={styles.topNavigation}>
        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tabButton} ${activeTab === 'events' ? styles.tabButtonActive : ''}`}
            onClick={() => onTabChange('events')}
            type="button"
          >
            {t('feed.tabs.events', 'События')}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'profiles' ? styles.tabButtonActive : ''}`}
            onClick={() => onTabChange('profiles')}
            type="button"
          >
            {t('feed.tabs.profiles', 'Люди')}
          </button>
        </div>

        {activeTab === 'events' && (
          <button
            className={`${styles.filterButton} ${hasActiveFilters ? styles.filterButtonActive : ''}`}
            onClick={onFilterClick}
            type="button"
            aria-label={t('feed.filters.open', 'Открыть фильтры')}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6H20M7 12H17M10 18H14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};
