import React from 'react';
import styles from './Whateconomic.module.css';
import { WhateconomicProps } from './Whateconomic.types';

/**
 * Whateconomic component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.120Z
 */
export const Whateconomic: React.FC<WhateconomicProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whateconomic} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whateconomic.displayName = 'Whateconomic';
