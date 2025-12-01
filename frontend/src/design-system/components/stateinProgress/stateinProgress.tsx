import React from 'react';
import styles from './Stateinprogress.module.css';
import { StateinprogressProps } from './Stateinprogress.types';

/**
 * Stateinprogress component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.138Z
 */
export const Stateinprogress: React.FC<StateinprogressProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.stateinprogress} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Stateinprogress.displayName = 'Stateinprogress';
