/**
 * NotificationsEmptyState component
 * Empty state for notifications screen
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './NotificationsEmptyState.module.css';

export const NotificationsEmptyState: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyState}>
      <h2 className={styles.emptyStateTitle}>{t('notifications.empty.title')}</h2>
      <p className={styles.emptyStateSubtitle}>{t('notifications.empty.subtitle')}</p>
    </div>
  );
};
