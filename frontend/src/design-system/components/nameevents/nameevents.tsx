import React from 'react';
import styles from './nameevents.module.css';
import { NameeventsProps } from './nameevents.types';

/**
 * Nameevents component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.123Z
 */
export const Nameevents: React.FC<NameeventsProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameevents} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameevents.displayName = 'Nameevents';
