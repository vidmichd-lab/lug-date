/**
 * ProfilePopup component
 * Popup for viewing user profile
 */

import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../api/client';
import styles from './ProfilePopup.module.css';
import type { ProfilePopupProps } from './ProfilePopup.types';

interface UserProfile {
  id: string;
  name: string;
  age?: number;
  photo?: string;
  bio?: string;
  job?: string;
  company?: string;
  interests?: string[];
}

export const ProfilePopup: FC<ProfilePopupProps> = ({ userId, onClose }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<{ user: UserProfile }>(`/api/v1/users/${userId}`, {
          requireAuth: true,
        });

        if (response.success && response.data) {
          setProfile(response.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} type="button" aria-label={t('common.close')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {profile.photo && (
          <img src={profile.photo} alt={profile.name} className={styles.profilePhoto} />
        )}

        <h2 className={styles.profileName}>
          {profile.name} {profile.age && profile.age}
        </h2>

        {(profile.job || profile.company) && (
          <p className={styles.profileJob}>
            {profile.job}
            {profile.job && profile.company && ' в '}
            {profile.company}
          </p>
        )}

        {profile.bio && <p className={styles.profileBio}>{profile.bio}</p>}
      </div>
    </div>
  );
};



