/**
 * ProfileHeader component
 * Header for registration/profile creation screens
 */

import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nameback } from '../../design-system/components/nameback';
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
          <Nameback className={styles.backIcon} />
        </button>

        <h1 className={styles.title}>{title}</h1>

        <span className={styles.stepIndicator}>
          {currentStep}/{totalSteps}
        </span>
      </div>
    </header>
  );
};
