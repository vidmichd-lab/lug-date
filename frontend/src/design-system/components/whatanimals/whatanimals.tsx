import React from 'react';
import styles from './Whatanimals.module.css';
import { WhatanimalsProps } from './Whatanimals.types';

/**
 * Whatanimals component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.115Z
 */
export const Whatanimals: React.FC<WhatanimalsProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatanimals} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatanimals.displayName = 'Whatanimals';
