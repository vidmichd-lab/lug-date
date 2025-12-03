/**
 * ProfileHeader component
 * Header for registration/profile creation screens
 */

import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icon';
import styles from './ProfileHeader.module.css';
import type { ProfileHeaderProps } from './ProfileHeader.types';

export const ProfileHeader: FC<ProfileHeaderProps> = ({
  showBackButton = true,
  title,
  currentStep,
  totalSteps,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <button
          className={`${styles.backButton} ${!showBackButton ? styles.backButtonHidden : ''}`}
          onClick={handleBack}
          type="button"
          aria-label="Назад"
        >
          <Icon name="back" size={24} className={styles.backIcon} />
        </button>

        <h1 className={styles.title}>{title}</h1>

        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
            aria-label={`Step ${currentStep} of ${totalSteps}`}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
          />
        </div>
      </div>
    </header>
  );
};
