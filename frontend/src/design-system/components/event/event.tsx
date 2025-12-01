import React from 'react';
import styles from './event.module.css';
import { EventProps } from './event.types';

/**
 * Event component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.128Z
 */
export const Event: React.FC<EventProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.event} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Event.displayName = 'Event';
