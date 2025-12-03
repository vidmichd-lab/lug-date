/**
 * CityNotFoundModal component
 * Modal for explaining why a city is not available
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '../BottomSheet';
import styles from './CityNotFoundModal.module.css';
import type { CityNotFoundModalProps } from './CityNotFoundModal.types';

export const CityNotFoundModal: FC<CityNotFoundModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>{t('registration.citySelection.modal.title')}</h2>
        <p className={styles.description}>{t('registration.citySelection.modal.description')}</p>
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={onClose} type="button">
            {t('registration.citySelection.modal.okay')}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
