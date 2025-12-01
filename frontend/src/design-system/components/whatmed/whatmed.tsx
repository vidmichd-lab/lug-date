import React from 'react';
import styles from './Whatmed.module.css';
import { WhatmedProps } from './Whatmed.types';

/**
 * Whatmed component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.121Z
 */
export const Whatmed: React.FC<WhatmedProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatmed} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatmed.displayName = 'Whatmed';
