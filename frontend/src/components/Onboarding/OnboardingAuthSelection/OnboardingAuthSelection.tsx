/**
 * OnboardingAuthSelection component
 * Displays final onboarding screen with authentication options
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/Icon';
import { OnboardingProgress } from '../OnboardingProgress';
import styles from './OnboardingAuthSelection.module.css';
import type { OnboardingAuthSelectionProps } from './OnboardingAuthSelection.types';

export const OnboardingAuthSelection: FC<OnboardingAuthSelectionProps> = ({
  onTelegramAuth,
  onContinueGuest,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.progressWrapper}>
        <OnboardingProgress currentStep={3} totalSteps={3} />
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.descriptionContainer}>
          <h1 className={styles.title}>{t('onboarding.slide3.title')}</h1>
          <p className={styles.subtitle}>{t('onboarding.slide3.subtitle')}</p>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button className={styles.primaryButton} onClick={onTelegramAuth} type="button">
          <Icon name="tg" size={24} color="var(--color-inverted, #ffffff)" />
          {t('onboarding.authSelection.telegramAuth')}
        </button>

        <button className={styles.secondaryButton} onClick={onContinueGuest} type="button">
          {t('onboarding.authSelection.continueGuest')}
        </button>
      </div>
    </div>
  );
};
