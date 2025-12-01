import React from 'react';
import styles from './whatstandup.module.css';
import { WhatstandupProps } from './whatstandup.types';

/**
 * Whatstandup component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.117Z
 */
export const Whatstandup: React.FC<WhatstandupProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatstandup} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatstandup.displayName = 'Whatstandup';
