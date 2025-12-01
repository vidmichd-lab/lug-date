import React from 'react';
import styles from './whatdance.module.css';
import { WhatdanceProps } from './whatdance.types';

/**
 * Whatdance component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.111Z
 */
export const Whatdance: React.FC<WhatdanceProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatdance} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatdance.displayName = 'Whatdance';
