/**
 * DeleteAccountModal component
 * Modal for confirming account deletion
 */

import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DeleteAccountModal.module.css';
import type { DeleteAccountModalProps } from './DeleteAccountModal.types';

export const DeleteAccountModal: FC<DeleteAccountModalProps> = ({ onConfirm, onCancel }) => {
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
      <div className={styles.deleteAccountModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitleDelete}>{t('profile.deleteModal.title')}</h3>

        <p className={styles.modalDescriptionDelete}>{t('profile.deleteModal.description')}</p>

        <div className={styles.modalButtonsDelete}>
          <button className={styles.modalButtonDelete} onClick={onConfirm} type="button">
            {t('profile.deleteModal.delete')}
          </button>
          <button className={styles.modalButtonKeep} onClick={onCancel} type="button">
            {t('profile.deleteModal.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
