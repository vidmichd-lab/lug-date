/**
 * FeedHeader component
 * Header with tab switcher and categories
 */

import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className={styles.mainHeader}>
      <button className={styles.logoButton} onClick={handleLogoClick} type="button" aria-label="Home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

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

      <button
        className={styles.profileButton}
        onClick={handleProfileClick}
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
    </header>
  );
};

