/**
 * SavedEventCard component
 * Card for displaying saved events in the list
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SavedEventCard.module.css';
import type { SavedEventCardProps } from './SavedEventCard.types';

export const SavedEventCard: FC<SavedEventCardProps> = ({ event, onRemove, onOpenLink }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.savedEventCard}>
      <span className={styles.venueBadge}>{event.venue}</span>

      <button className={styles.removeButton} onClick={onRemove} type="button" aria-label={t('common.delete')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={styles.eventImageContainer}>
        <img src={event.image} alt={event.title} className={styles.eventImage} loading="lazy" />

        <div className={styles.eventOverlay}>
          <h3 className={styles.eventTitle}>{event.title}</h3>

          <p className={styles.eventMeta}>
            {event.type} · {event.date} · {event.price}
          </p>

          <button className={styles.openLinkButton} onClick={onOpenLink} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11M15 3H21M21 3V9M21 3L10 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t('saved.openLink')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

