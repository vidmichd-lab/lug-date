import React from 'react';
import styles from './whatpoetry.module.css';
import { WhatpoetryProps } from './whatpoetry.types';

/**
 * Whatpoetry component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.116Z
 */
export const Whatpoetry: React.FC<WhatpoetryProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatpoetry} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatpoetry.displayName = 'Whatpoetry';
