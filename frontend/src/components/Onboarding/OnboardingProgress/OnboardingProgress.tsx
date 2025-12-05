/**
 * OnboardingProgress component
 * Displays progress indicator for onboarding steps
 */

import { FC } from 'react';
import styles from './OnboardingProgress.module.css';
import type { OnboardingProgressProps } from './OnboardingProgress.types';

export const OnboardingProgress: FC<OnboardingProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div
            key={stepNumber}
            className={`${styles.progressStep} ${
              isActive || isCompleted ? styles.progressStepActive : ''
            } ${isCompleted ? styles.progressStepCompleted : ''}`}
            aria-label={`Step ${stepNumber} of ${totalSteps}`}
          />
        );
      })}
    </div>
  );
};

