import React from 'react';
import styles from './Whatecology.module.css';
import { WhatecologyProps } from './Whatecology.types';

/**
 * Whatecology component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.115Z
 */
export const Whatecology: React.FC<WhatecologyProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatecology} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatecology.displayName = 'Whatecology';
