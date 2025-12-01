/**
 * ProfilePreviewScreen component
 * Ninth step of registration: Final profile preview
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { useRegistrationStore, useOnboardingStore } from '../../../stores';
import { calculateAge } from '../DateOfBirthScreen/utils';
import { INTERESTS_DATA } from '../InterestsScreen/interestsData';
import styles from './ProfilePreviewScreen.module.css';
import type { ProfilePreviewScreenProps } from './ProfilePreviewScreen.types';

export const ProfilePreviewScreen: React.FC<ProfilePreviewScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, resetRegistration } = useRegistrationStore();
  const { completeOnboarding } = useOnboardingStore();

  // Calculate age from date of birth
  const age = useMemo(() => {
    if (!data.dateOfBirth) return null;
    const { day, month, year } = data.dateOfBirth;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    return calculateAge(birthDate);
  }, [data.dateOfBirth]);

  // Get goal label
  const goalLabel = useMemo(() => {
    if (!data.goal) return null;
    return t(`registration.goalSelection.options.${data.goal}`);
  }, [data.goal, t]);

  // Get interests with icons (first 2)
  const displayInterests = useMemo(() => {
    if (!data.interests || data.interests.length === 0) return [];
    return data.interests
      .slice(0, 2)
      .map((interestId) => INTERESTS_DATA.find((i) => i.id === interestId))
      .filter((interest) => interest !== undefined);
  }, [data.interests]);

  // Format job title and company
  const jobText = useMemo(() => {
    if (data.jobTitle && data.company) {
      return `${data.jobTitle} в ${data.company}`;
    }
    return data.jobTitle || data.company || null;
  }, [data.jobTitle, data.company]);

  const handleCreateProfile = async () => {
    try {
      // TODO: Call API to complete registration and save profile data
      // For now, just mark onboarding as completed and navigate
      
      // Mark onboarding as completed (this allows access to main app)
      completeOnboarding();
      
      // Clear registration data
      resetRegistration();
      
      // Mark registration as completed
      localStorage.setItem('registrationCompleted', 'true');
      
      // Navigate to home
      navigate('/');
      onComplete();
    } catch (error) {
      console.error('Failed to complete registration:', error);
      // TODO: Show error toast
    }
  };

  return (
    <div className={styles.container}>
      <ProfileHeader
        showBackButton
        title={t('registration.header.title')}
        currentStep={9}
        totalSteps={9}
        onBack={onBack}
      />

      <div className={styles.content}>
        <div className={styles.profileCardPreview}>
          {/* Photo Section with Header */}
          <div className={styles.profilePhotoSection}>
            <div className={styles.profileCardHeader}>
              {goalLabel && (
                <span className={styles.goalBadge}>{goalLabel}</span>
              )}
              <button className={styles.menuButton} type="button" aria-label="Menu">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt={data.firstName}
                className={styles.profilePhoto}
              />
            ) : (
              <div className={styles.profilePhotoPlaceholder}>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className={styles.profileCardContent}>
            <h2 className={styles.profileName}>
              {data.firstName}
              {age !== null && data.showAge && ` ${age}`}
            </h2>

            {jobText && <p className={styles.profileJob}>{jobText}</p>}

            {data.bio && (
              <p className={styles.profileBio}>{data.bio}</p>
            )}

            {displayInterests.length > 0 && (
              <div className={styles.interestsRow}>
                {displayInterests.map((interest, index) => {
                  if (!interest) return null;
                  const IconComponent = interest.iconComponent;
                  return (
                    <div key={interest.id || index} className={styles.interestTagSmall}>
                      <span
                        className={styles.interestIconSmall}
                        style={{ backgroundColor: interest.color }}
                      >
                        <IconComponent />
                      </span>
                      <span>{interest.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          className={styles.createProfileButton}
          onClick={handleCreateProfile}
          type="button"
        >
          <span>{t('registration.profilePreview.createButton')}</span>
          <svg
            className={styles.createProfileIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

