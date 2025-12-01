import React from 'react';
import styles from './whatbike.module.css';
import { WhatbikeProps } from './whatbike.types';

/**
 * Whatbike component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.116Z
 */
export const Whatbike: React.FC<WhatbikeProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatbike} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatbike.displayName = 'Whatbike';
