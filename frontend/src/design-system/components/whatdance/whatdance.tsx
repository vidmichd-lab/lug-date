import React from 'react';
import styles from './Whatdance.module.css';
import { WhatdanceProps } from './Whatdance.types';

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
