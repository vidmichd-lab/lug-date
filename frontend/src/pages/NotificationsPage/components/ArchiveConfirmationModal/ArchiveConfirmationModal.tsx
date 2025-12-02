/**
 * ArchiveConfirmationModal component
 * Modal for confirming archiving of a notification
 */

import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ArchiveConfirmationModal.module.css';
import type { ArchiveConfirmationModalProps } from './ArchiveConfirmationModal.types';

export const ArchiveConfirmationModal: FC<ArchiveConfirmationModalProps> = ({
  userName,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.archiveConfirmationModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{t('notifications.archiveModal.title')}</h3>

        <p className={styles.modalDescription}>
          {t('notifications.archiveModal.description', { userName })}
        </p>

        <div className={styles.modalButtons}>
          <button className={styles.modalButtonSecondary} onClick={onCancel} type="button">
            {t('notifications.archiveModal.no')}
          </button>
          <button className={styles.modalButtonSecondary} onClick={onConfirm} type="button">
            {t('notifications.archiveModal.yes')}
          </button>
        </div>
      </div>
    </div>
  );
};
