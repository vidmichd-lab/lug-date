import React from 'react';
import styles from './Whatmusic.module.css';
import { WhatmusicProps } from './Whatmusic.types';

/**
 * Whatmusic component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.111Z
 */
export const Whatmusic: React.FC<WhatmusicProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatmusic} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatmusic.displayName = 'Whatmusic';
