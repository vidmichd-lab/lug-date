import React from 'react';
import styles from './Whatrun.module.css';
import { WhatrunProps } from './Whatrun.types';

/**
 * Whatrun component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.116Z
 */
export const Whatrun: React.FC<WhatrunProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatrun} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatrun.displayName = 'Whatrun';
