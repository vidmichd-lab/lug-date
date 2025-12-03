/**
 * EventCard component
 * Card for displaying events in the feed
 */

import { FC, useMemo } from 'react';
import styles from './EventCard.module.css';
import type { EventCardProps } from './EventCard.types';

export const EventCard: FC<EventCardProps> = ({ event, onLinkClick }) => {
  // Get random 3 avatars from savedBy array
  const displayAvatars = useMemo(() => {
    if (!event.savedBy || event.savedBy.length === 0) return [];
    const shuffled = [...event.savedBy].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [event.savedBy]);

  // Format end date
  const formatEndDate = (date?: string) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      const months = [
        'янв',
        'фев',
        'мар',
        'апр',
        'май',
        'июн',
        'июл',
        'авг',
        'сен',
        'окт',
        'ноя',
        'дек',
      ];
      return `до ${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return date;
    }
  };

  // Format price
  const formatPrice = (price?: number | string) => {
    if (!price) return '';
    if (typeof price === 'number') {
      return `${price} ₽`;
    }
    return price;
  };

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventImageContainer}>
        <img src={event.image} alt={event.title} className={styles.eventImage} />
        <div className={styles.eventOverlay} />

        {/* Header with venue tag and link button */}
        <div className={styles.header}>
          {event.venue && (
            <div className={styles.venueTag}>
              <div className={styles.venueIcon} />
              <span className={styles.venueText}>{event.venue}</span>
            </div>
          )}
          {event.linkUrl && (
            <button
              className={styles.linkButton}
              onClick={(e) => {
                e.stopPropagation();
                onLinkClick?.();
              }}
              type="button"
              aria-label="Открыть ссылку"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Avatars and count */}
          {(displayAvatars.length > 0 || event.savedCount) && (
            <div className={styles.savedBy}>
              <div className={styles.avatars}>
                {displayAvatars.map((user, index) => (
                  <div
                    key={user.id}
                    className={styles.avatar}
                    style={{ zIndex: displayAvatars.length - index }}
                  >
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.firstName} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {user.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {event.savedCount !== undefined && event.savedCount > 0 && (
                <span className={styles.savedCount}>+{event.savedCount}</span>
              )}
            </div>
          )}

          {/* Title */}
          <div className={styles.titleContainer}>
            <h3 className={styles.eventTitle}>{event.title}</h3>

            {/* Meta info: category, end date, price */}
            <div className={styles.metaInfo}>
              {event.categoryLabel && (
                <span className={styles.metaItem}>{event.categoryLabel}</span>
              )}
              {event.endDate && (
                <span className={styles.metaItem}>{formatEndDate(event.endDate)}</span>
              )}
              {(event.averagePrice || event.price) && (
                <span className={styles.metaItem}>
                  {formatPrice(event.averagePrice || event.price)}
                </span>
              )}
            </div>
          </div>

          {/* Description (max 6 lines) */}
          {event.description && <p className={styles.eventDescription}>{event.description}</p>}
        </div>
      </div>
    </div>
  );
};
