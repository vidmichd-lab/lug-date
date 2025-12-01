import React from 'react';
import styles from './Whatit.module.css';
import { WhatitProps } from './Whatit.types';

/**
 * Whatit component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.114Z
 */
export const Whatit: React.FC<WhatitProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatit} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatit.displayName = 'Whatit';
