/**
 * NotificationCard component
 * Card for displaying match notifications
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './NotificationCard.module.css';
import type { NotificationCardProps } from './NotificationCard.types';

export const NotificationCard: FC<NotificationCardProps> = ({
  notification,
  onViewProfile,
  onViewEvent,
  onWrite,
  onConfirmMeeting,
  onArchive,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.notificationCard}>
      <button className={styles.archiveButton} onClick={onArchive} type="button" aria-label={t('notifications.archive')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={styles.dualAvatarContainer}>
        <img
          src={notification.user.avatar}
          alt={notification.user.name}
          className={styles.userAvatar}
        />
        <img
          src={notification.event.image}
          alt={notification.event.title}
          className={styles.eventThumbnail}
        />
      </div>

      <h3 className={styles.notificationTitle}>{t('notifications.matchTitle')}</h3>

      <p className={styles.notificationDescription}>
        {notification.user.name} {t('notifications.matchDescription')}{' '}
        <strong>{notification.event.title}</strong> {t('notifications.matchDescriptionEnd')}
      </p>

      <div className={styles.actionButtonsRow}>
        <button
          className={styles.actionButton}
          onClick={onViewProfile}
          type="button"
          title={t('notifications.viewProfile')}
          aria-label={t('notifications.viewProfile')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          className={styles.actionButton}
          onClick={onViewEvent}
          type="button"
          title={t('notifications.viewEvent')}
          aria-label={t('notifications.viewEvent')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 16L8.586 11.414C8.96106 11.0391 9.46968 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className={`${styles.actionButton} ${styles.actionButtonWrite}`}
          onClick={onWrite}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t('notifications.write')}</span>
        </button>

        <button
          className={`${styles.actionButton} ${styles.actionButtonConfirm}`}
          onClick={onConfirmMeeting}
          type="button"
          title={t('notifications.confirmMeeting')}
          aria-label={t('notifications.confirmMeeting')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};



