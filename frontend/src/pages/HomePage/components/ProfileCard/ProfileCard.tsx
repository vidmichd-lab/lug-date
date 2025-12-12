/**
 * ProfileCard component
 * Card for displaying user profiles in the feed
 */

import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { INTERESTS_DATA } from '../../../RegistrationPage/InterestsScreen/interestsData';
import styles from './ProfileCard.module.css';
import type { ProfileCardProps } from './ProfileCard.types';

export const ProfileCard: FC<ProfileCardProps> = ({ profile }) => {
  const { t } = useTranslation();

  // Get goal label
  const goalLabel = useMemo(() => {
    return t(`registration.goalSelection.options.${profile.goal}`) || profile.goal;
  }, [profile.goal, t]);

  // Get interests with icons (first 2)
  const displayInterests = useMemo(() => {
    if (!profile.interests || profile.interests.length === 0) return [];
    return profile.interests
      .slice(0, 2)
      .map((interestId) => INTERESTS_DATA.find((i) => i.id === interestId))
      .filter((interest) => interest !== undefined);
  }, [profile.interests]);

  // Format job title and company
  const jobText = useMemo(() => {
    if (profile.job && profile.company) {
      return `${profile.job} в ${profile.company}`;
    }
    return profile.job || profile.company || null;
  }, [profile.job, profile.company]);

  return (
    <div className={styles.profileCard}>
      {/* Photo Section with Header */}
      <div className={styles.profilePhotoSection}>
        <div className={styles.profileCardHeader}>
          {goalLabel && <span className={styles.goalBadge}>{goalLabel}</span>}
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
        {profile.photo ? (
          <img src={profile.photo} alt={profile.name} className={styles.profilePhoto} />
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
          {profile.name} {profile.age}
        </h2>

        {jobText && <p className={styles.profileJob}>{jobText}</p>}

        {profile.bio && <p className={styles.profileBio}>{profile.bio}</p>}

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
  );
};
