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
  return (
    <div className={styles.slideContainer}>
      <OnboardingProgress currentStep={step} totalSteps={totalSteps} />
      
      <div className={styles.contentContainer}>
        <div className={styles.descriptionContainer}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          
          {illustration ? (
            <img
              src={illustration}
              alt=""
              className={styles.illustration}
              loading="lazy"
            />
          ) : (
            <div className={styles.illustrationPlaceholder}>
              {/* Placeholder for future illustration */}
            </div>
          )}
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={styles.button}
          onClick={onNext}
          type="button"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};



