/**
 * ProfileHeader component
 * Header for registration/profile creation screens
 */

import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <button
          className={`${styles.backButton} ${!showBackButton ? styles.backButtonHidden : ''}`}
          onClick={handleBack}
          type="button"
          aria-label="Назад"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1 className={styles.title}>{title}</h1>

        <span className={styles.stepIndicator}>
          {currentStep}/{totalSteps}
        </span>
      </div>
    </header>
  );
};

