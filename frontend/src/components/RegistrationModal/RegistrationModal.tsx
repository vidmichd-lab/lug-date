/**
 * RegistrationModal component
 * Modal sheet that appears when guest user tries to perform an action
 */

import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './RegistrationModal.module.css';

export interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal: FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRegister = () => {
    onClose();
    navigate('/registration');
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('registrationModal.title', 'Зарегистрируйтесь')}</h2>
          <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.message}>
            {t('registrationModal.message', 'Для выполнения этого действия необходимо зарегистрироваться')}
          </p>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose} type="button">
            {t('common.cancel', 'Отмена')}
          </button>
          <button className={styles.registerButton} onClick={handleRegister} type="button">
            {t('registrationModal.register', 'Зарегистрироваться')}
          </button>
        </div>
      </div>
    </>
  );
};

