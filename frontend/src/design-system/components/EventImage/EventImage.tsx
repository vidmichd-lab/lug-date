import React from 'react';
import styles from './EventImage.module.css';
import { EventImageProps } from './EventImage.types';

/**
 * EventImage component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.129Z
 */
export const EventImage: React.FC<EventImageProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.eventimage} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

EventImage.displayName = 'EventImage';
