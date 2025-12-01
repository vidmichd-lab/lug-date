import React from 'react';
import styles from './whatarchitecture.module.css';
import { WhatarchitectureProps } from './whatarchitecture.types';

/**
 * Whatarchitecture component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.109Z
 */
export const Whatarchitecture: React.FC<WhatarchitectureProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatarchitecture} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatarchitecture.displayName = 'Whatarchitecture';
