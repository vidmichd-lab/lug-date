/**
 * SavedEmptyState component
 * Empty state for saved events screen
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SavedEmptyState.module.css';

export const SavedEmptyState: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyState}>
      <h2 className={styles.emptyStateTitle}>{t('saved.empty.title')}</h2>
      <p className={styles.emptyStateSubtitle}>{t('saved.empty.subtitle')}</p>
    </div>
  );
};



