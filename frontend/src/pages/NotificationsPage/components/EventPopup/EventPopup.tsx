/**
 * EventPopup component
 * Popup for viewing event details
 */

import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../api/client';
import styles from './EventPopup.module.css';
import type { EventPopupProps } from './EventPopup.types';

interface Event {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  venue?: string;
  date?: string;
  price?: string;
  category?: string;
  link?: string;
}

export const EventPopup: FC<EventPopupProps> = ({ eventId, onClose }) => {
  const { t } = useTranslation();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<{ event: Event }>(`/api/v1/events/${eventId}`, {
          requireAuth: true,
        });

        if (response.success && response.data) {
          setEvent(response.data.event);
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const handleOpenLink = () => {
    if (event.link) {
      window.open(event.link, '_blank', 'noopener,noreferrer');
    }
  };

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

        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className={styles.eventImage} />
        )}

        <h2 className={styles.eventTitle}>{event.title}</h2>

        {event.venue && <p className={styles.eventVenue}>{event.venue}</p>}

        {(event.date || event.price) && (
          <div className={styles.eventMeta}>
            {event.date && <span>{event.date}</span>}
            {event.date && event.price && <span> · </span>}
            {event.price && <span>{event.price}</span>}
          </div>
        )}

        {event.description && <p className={styles.eventDescription}>{event.description}</p>}

        {event.link && (
          <button className={styles.openLinkButton} onClick={handleOpenLink} type="button">
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
        )}
      </div>
    </div>
  );
};



