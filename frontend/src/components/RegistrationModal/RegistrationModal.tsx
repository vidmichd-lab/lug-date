/**
 * RegistrationModal component
 * Bottom sheet that appears when guest user tries to perform an action
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

  const handleContinueGuest = () => {
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>{t('registrationModal.title', 'Создайте аккаунт')}</h2>
            <p className={styles.subtitle}>{t('registrationModal.subtitle', 'Чтобы находить')}</p>
          </div>
          <div className={styles.content}>
            <div className={styles.buttonGroup}>
              <button className={styles.telegramButton} onClick={handleRegister} type="button">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 16.08C15.37 16.8 15.09 17.01 14.83 17.03C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 14.95 9.7 15.05 9.37C15.06 9.33 15.07 9.18 14.97 9.09C14.87 9 14.73 9.03 14.63 9.05C14.5 9.08 12.17 10.24 8.84 12.08C8.24 12.4 7.7 12.56 7.22 12.54C6.7 12.52 5.68 12.23 4.89 11.97C3.93 11.66 3.18 11.49 3.24 11.01C3.27 10.77 3.62 10.53 4.25 10.29C8.32 8.58 11.26 7.3 13.08 6.46C17.1 4.71 17.73 4.5 18.17 4.5C18.28 4.5 18.52 4.53 18.66 4.64C18.78 4.74 18.82 4.87 18.84 4.97C18.86 5.07 18.88 5.3 18.86 5.45C18.83 5.78 17.93 8.65 16.64 8.8Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{t('registrationModal.telegramButton', 'Регистрация через Telegram')}</span>
              </button>
              <button className={styles.guestButton} onClick={handleContinueGuest} type="button">
                {t('registrationModal.guestButton', 'Продолжить без регистрации')}
              </button>
            </div>
            <p className={styles.agreement}>
              {t('registrationModal.agreement.prefix', 'Нажимая кнопку «Войти через Telegram»,')}
              <br aria-hidden="true" />
              {t('registrationModal.agreement.text', 'я принимаю ')}
              <a
                href="/terms"
                className={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Open terms
                }}
              >
                {t('registrationModal.agreement.terms', 'Пользовательское соглашение')}
              </a>
              {t('registrationModal.agreement.and', ' и ')}
              <a
                href="/privacy"
                className={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Open privacy
                }}
              >
                {t('registrationModal.agreement.privacy', 'Политику конфиденциальности')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
