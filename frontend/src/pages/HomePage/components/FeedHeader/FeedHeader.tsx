/**
 * FeedHeader component
 * Header with tab switcher and categories
 */

import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FeedHeader.module.css';
import type { FeedHeaderProps } from './FeedHeader.types';

export const FeedHeader: FC<FeedHeaderProps> = ({
  activeTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  categories,
  showCategories,
}) => {
  const { t } = useTranslation();
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  return (
    <header className={styles.mainHeader}>
      <div className={styles.tabSwitcher}>
        <button
          className={`${styles.tabButton} ${activeTab === 'events' ? styles.tabButtonActive : ''}`}
          onClick={() => onTabChange('events')}
          type="button"
        >
          {t('feed.tabs.events')}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'profiles' ? styles.tabButtonActive : ''}`}
          onClick={() => onTabChange('profiles')}
          type="button"
        >
          {t('feed.tabs.profiles')}
        </button>
      </div>

      {showCategories && (
        <div className={styles.categoriesContainer} ref={categoriesScrollRef}>
          <div className={styles.categoriesScroll}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryPill} ${
                  selectedCategory === category ? styles.categoryPillActive : ''
                }`}
                onClick={() => onCategoryChange(category)}
                type="button"
              >
                {category === 'all' ? t('feed.categories.all') : category}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

