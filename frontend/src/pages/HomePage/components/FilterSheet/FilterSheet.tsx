/**
 * FilterSheet component
 * Bottom sheet for filtering events by category
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '../../../../components/BottomSheet';
import styles from './FilterSheet.module.css';

export interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

export const FilterSheet: FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  onCategoryToggle,
}) => {
  const { t } = useTranslation();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.header}>
        <p className={styles.title}>{t('feed.filters.title', 'Выберите категорию')}</p>
      </div>
      <div className={styles.categories}>
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <button
              key={category}
              className={`${styles.categoryButton} ${
                isSelected ? styles.categoryButtonActive : ''
              }`}
              onClick={() => onCategoryToggle(category)}
              type="button"
            >
              {t(`feed.categories.${category}`, category)}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};
