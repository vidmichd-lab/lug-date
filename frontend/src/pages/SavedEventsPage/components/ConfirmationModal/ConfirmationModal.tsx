/**
 * ConfirmationModal component
 * Modal for confirming removal of saved event
 */

import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ConfirmationModal.module.css';
import type { ConfirmationModalProps } from './ConfirmationModal.types';

export const ConfirmationModal: FC<ConfirmationModalProps> = ({ title, onConfirm, onCancel }) => {
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
      <div className={styles.confirmationModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{title}</h3>

        <div className={styles.modalButtons}>
          <button className={styles.modalButton} onClick={onCancel} type="button">
            {t('saved.confirmRemove.no')}
          </button>
          <button className={styles.modalButton} onClick={onConfirm} type="button">
            {t('saved.confirmRemove.yes')}
          </button>
        </div>
      </div>
    </div>
  );
};

