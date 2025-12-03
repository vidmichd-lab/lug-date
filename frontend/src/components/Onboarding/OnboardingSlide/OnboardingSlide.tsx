/**
 * OnboardingSlide component
 * Displays a single onboarding slide with content and navigation
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../Icon';
import { OnboardingProgress } from '../OnboardingProgress';
import styles from './OnboardingSlide.module.css';
import type { OnboardingSlideProps } from './OnboardingSlide.types';

export const OnboardingSlide: FC<OnboardingSlideProps> = ({
  step,
  title,
  subtitle,
  illustration,
  buttonText,
  onNext,
  totalSteps,
  showAuthButtons = false,
  onTelegramAuth,
  onContinueGuest,
}) => {
  const { t } = useTranslation();
  const showProgress = step > 1;
  const showContent = step > 1;

  return (
    <div className={styles.slideContainer}>
      {showProgress && (
        <div className={styles.progressWrapper}>
          <OnboardingProgress currentStep={step} totalSteps={totalSteps} />
        </div>
      )}

      {showContent && (
        <div className={styles.contentContainer}>
          <div className={styles.descriptionContainer}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

            {illustration ? (
              <img src={illustration} alt="" className={styles.illustration} loading="lazy" />
            ) : null}
          </div>
        </div>
      )}

      <div className={styles.buttonContainer}>
        {showAuthButtons ? (
          <>
            <button className={styles.primaryButton} onClick={onTelegramAuth} type="button">
              <Icon name="tg" size={24} color="var(--color-inverted, #ffffff)" />
              {t('onboarding.authSelection.telegramAuth')}
            </button>
            <button className={styles.secondaryButton} onClick={onContinueGuest} type="button">
              {t('onboarding.authSelection.continueGuest')}
            </button>
          </>
        ) : (
          buttonText &&
          onNext && (
            <button className={styles.button} onClick={onNext} type="button">
              {buttonText}
            </button>
          )
        )}
      </div>
    </div>
  );
};
