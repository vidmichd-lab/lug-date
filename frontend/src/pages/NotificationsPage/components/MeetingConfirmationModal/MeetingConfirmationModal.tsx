/**
 * MeetingConfirmationModal component
 * Modal for confirming that a meeting took place
 */

import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MeetingConfirmationModal.module.css';
import type { MeetingConfirmationModalProps } from './MeetingConfirmationModal.types';

export const MeetingConfirmationModal: FC<MeetingConfirmationModalProps> = ({
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
      <div className={styles.meetingConfirmationModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{t('notifications.meetingModal.title')}</h3>

        <p className={styles.modalDescription}>
          {t('notifications.meetingModal.description', { userName })}
        </p>

        <div className={styles.modalButtons}>
          <button className={styles.modalButtonSecondary} onClick={onCancel} type="button">
            {t('notifications.meetingModal.no')}
          </button>
          <button className={styles.modalButtonPrimary} onClick={onConfirm} type="button">
            {t('notifications.meetingModal.yes')}
          </button>
        </div>
      </div>
    </div>
  );
};

