/**
 * EventCard component
 * Card for displaying events in the feed
 */

import { FC } from 'react';
import styles from './EventCard.module.css';
import type { EventCardProps } from './EventCard.types';

export const EventCard: FC<EventCardProps> = ({ event }) => {
  return (
    <div className={styles.eventCard}>
      <div className={styles.eventImageContainer}>
        <div className={styles.venueBadge}>{event.venue}</div>
        <img src={event.image} alt={event.title} className={styles.eventImage} />
        <div className={styles.eventOverlay} />
        <div className={styles.eventInfo}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          <div className={styles.eventMeta}>
            <span className={styles.eventDate}>{event.date}</span>
            <span className={styles.eventPrice}>{event.price}</span>
          </div>
          {event.description && (
            <p className={styles.eventDescription}>{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};



