/**
 * CategoryTabs component
 * Horizontal scrollable category filter tabs
 */

import { FC } from 'react';
import styles from './CategoryTabs.module.css';
import type { CategoryTabsProps } from './CategoryTabs.types';

export const CategoryTabs: FC<CategoryTabsProps> = ({ categories, selected, onChange }) => {
  return (
    <div className={styles.categoryTabs}>
      {categories.map((category) => (
        <button
          key={category}
          className={`${styles.categoryTab} ${selected === category ? styles.active : ''}`}
          onClick={() => onChange(category)}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  );
};
