import React from 'react';
import styles from './whatgames.module.css';
import { WhatgamesProps } from './whatgames.types';

/**
 * Whatgames component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.117Z
 */
export const Whatgames: React.FC<WhatgamesProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatgames} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatgames.displayName = 'Whatgames';
