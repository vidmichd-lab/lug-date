import React from 'react';
import styles from './Whatmarketing.module.css';
import { WhatmarketingProps } from './Whatmarketing.types';

/**
 * Whatmarketing component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.119Z
 */
export const Whatmarketing: React.FC<WhatmarketingProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatmarketing} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatmarketing.displayName = 'Whatmarketing';
