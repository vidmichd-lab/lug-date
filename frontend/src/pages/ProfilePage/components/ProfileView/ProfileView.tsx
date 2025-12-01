/**
 * ProfileView component
 * View mode for user profile
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { INTERESTS_DATA } from '../../../RegistrationPage/InterestsScreen/interestsData';
import styles from './ProfileView.module.css';
import type { ProfileViewProps } from './ProfileView.types';

const GOAL_LABELS: Record<string, string> = {
  'find-friends': 'Найти друзей',
  'networking': 'Нетворкинг',
  'dating': 'Познакомиться',
  'serious-relationship': 'Серьезные отношения',
  'other': 'Другой',
};

export const ProfileView: FC<ProfileViewProps> = ({
  profile,
  onEdit,
  onSettings,
  onLogout,
  onThreeDotMenu,
}) => {
  const { t } = useTranslation();

  // Get selected interests with their data
  const selectedInterests = INTERESTS_DATA.filter((interest) =>
    profile.interests.includes(interest.id)
  );

  const goalLabel = GOAL_LABELS[profile.goal] || profile.goal;

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>{t('profile.title')}</h1>
        <button
          className={styles.settingsButton}
          onClick={onSettings}
          type="button"
          aria-label={t('profile.settings')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1225 17.2863 20.22 17.5271C20.3175 17.7679 20.3638 18.0245 20.3564 18.2824C20.349 18.5403 20.2881 18.7942 20.1775 19.0288C20.0669 19.2634 19.9092 19.4738 19.713 19.647L19.663 19.697C19.5438 19.8081 19.4078 19.8989 19.2606 19.9657C19.1134 20.0325 18.9572 20.0743 18.797 20.0894C18.6368 20.1045 18.4748 20.0927 18.318 20.0546C18.1612 20.0165 18.0118 19.9526 17.876 19.865L17.816 19.815C17.5803 19.5845 17.281 19.4298 16.9566 19.371C16.6322 19.3122 16.2976 19.3519 15.996 19.485V19.485C15.6944 19.6181 15.3598 19.6578 15.0354 19.599C14.711 19.5402 14.4117 19.3855 14.176 19.155L14.116 19.105C13.9317 18.919 13.7862 18.6984 13.6887 18.4576C13.5912 18.2168 13.5449 17.9602 13.5523 17.7023C13.5597 17.4444 13.6206 17.1905 13.7312 16.9559C13.8418 16.7213 13.9995 16.5109 14.195 16.338L14.265 16.278C14.5007 16.0475 14.8 15.8928 15.1244 15.834C15.4488 15.7752 15.7834 15.8149 16.085 15.948H16.135C16.4366 15.8149 16.7712 15.7752 17.0956 15.834C17.42 15.8928 17.7193 16.0475 17.954 16.278L18.014 16.338C18.2095 16.5109 18.3672 16.7213 18.4778 16.9559C18.5884 17.1905 18.6493 17.4444 18.6567 17.7023C18.6641 17.9602 18.6178 18.2168 18.5203 18.4576C18.4228 18.6984 18.2773 18.919 18.093 19.105L18.043 19.155C17.8125 19.3907 17.6578 19.69 17.599 20.0144C17.5402 20.3388 17.5799 20.6734 17.713 20.975V20.975C17.8461 21.2766 17.9058 21.6112 17.847 21.9356C17.7882 22.26 17.6335 22.5593 17.403 22.795L17.353 22.855C17.1798 23.0505 16.9694 23.2082 16.7348 23.3188C16.5002 23.4294 16.2463 23.4903 15.9884 23.4977C15.7305 23.5051 15.4739 23.4588 15.2331 23.3613C14.9923 23.2638 14.7717 23.1183 14.585 22.934L14.535 22.884C14.3045 22.6483 14.1498 22.349 14.091 22.0246C14.0322 21.7002 14.0719 21.3656 14.205 21.064V21.064C14.3381 20.7624 14.3968 20.4278 14.338 20.1034C14.2792 19.779 14.1245 19.4797 13.894 19.244L13.834 19.184C13.6611 18.9885 13.4507 18.8308 13.2161 18.7202C12.9815 18.6096 12.7276 18.5487 12.4697 18.5413C12.2118 18.5339 11.9552 18.5802 11.7144 18.6777C11.4736 18.7752 11.253 18.9207 11.067 19.105L11.017 19.155C10.7865 19.3907 10.6318 19.69 10.573 20.0144C10.5142 20.3388 10.5539 20.6734 10.687 20.975"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.profilePhotoContainer}>
        <span className={styles.goalBadgeProfile}>{goalLabel}</span>
        {onThreeDotMenu && (
          <button
            className={styles.threeDotMenu}
            onClick={onThreeDotMenu}
            type="button"
            aria-label={t('profile.menu')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                fill="currentColor"
              />
              <path
                d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                fill="currentColor"
              />
              <path
                d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
        <img src={profile.photo} alt={profile.name} className={styles.profilePhoto} />
      </div>

      <div className={styles.profileInfo}>
        <h2 className={styles.profileName}>
          {profile.name} {profile.age}
        </h2>

        {(profile.job || profile.company) && (
          <p className={styles.profileJob}>
            {profile.job}
            {profile.job && profile.company && ' в '}
            {profile.company}
          </p>
        )}

        {profile.bio && <p className={styles.profileBio}>{profile.bio}</p>}

        {selectedInterests.length > 0 && (
          <div className={styles.interestsList}>
            {selectedInterests.map((interest) => (
              <div key={interest.id} className={styles.interestBadge}>
                <span className={styles.interestIcon} style={{ backgroundColor: interest.color }}>
                  <interest.iconComponent />
                </span>
                <span>{interest.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.profileActions}>
        <button className={styles.actionButtonLogout} onClick={onLogout} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t('profile.logout')}</span>
        </button>

        <button className={styles.actionButtonEdit} onClick={onEdit} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t('profile.edit')}</span>
        </button>
      </div>
    </div>
  );
};

