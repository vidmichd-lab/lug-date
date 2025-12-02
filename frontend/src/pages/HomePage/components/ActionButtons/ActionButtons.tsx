/**
 * ActionButtons component
 * Like/Dislike buttons for cards
 */

import { FC } from 'react';
import styles from './ActionButtons.module.css';

export interface ActionButtonsProps {
  onDislike: () => void;
  onLike: () => void;
}

export const ActionButtons: FC<ActionButtonsProps> = ({ onDislike, onLike }) => {
  return (
    <div className={styles.actionButtons}>
      <button
        className={`${styles.actionButton} ${styles.dislikeButton}`}
        onClick={onDislike}
        type="button"
        aria-label="Dislike"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className={`${styles.actionButton} ${styles.likeButton}`}
        onClick={onLike}
        type="button"
        aria-label="Like"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};
