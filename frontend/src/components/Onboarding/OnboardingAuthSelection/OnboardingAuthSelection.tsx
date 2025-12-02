/**
 * OnboardingAuthSelection component
 * Displays final onboarding screen with authentication options
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OnboardingAuthSelection.module.css';
import type { OnboardingAuthSelectionProps } from './OnboardingAuthSelection.types';

export const OnboardingAuthSelection: FC<OnboardingAuthSelectionProps> = ({
  onTelegramAuth,
  onContinueGuest,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <button className={styles.primaryButton} onClick={onTelegramAuth} type="button">
          <svg
            className={styles.telegramIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.12l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
          </svg>
          {t('onboarding.authSelection.telegramAuth')}
        </button>

        <button className={styles.secondaryButton} onClick={onContinueGuest} type="button">
          {t('onboarding.authSelection.continueGuest')}
        </button>
      </div>
    </div>
  );
};
