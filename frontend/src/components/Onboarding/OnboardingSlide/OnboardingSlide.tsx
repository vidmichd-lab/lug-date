/**
 * OnboardingSlide component
 * Displays a single onboarding slide with content and navigation
 */

import { FC } from 'react';
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
}) => {
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
        <button className={styles.button} onClick={onNext} type="button">
          {buttonText}
        </button>
      </div>
    </div>
  );
};
