import React from 'react';
import styles from './whatteach.module.css';
import { WhatteachProps } from './whatteach.types';

/**
 * Whatteach component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.122Z
 */
export const Whatteach: React.FC<WhatteachProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatteach} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatteach.displayName = 'Whatteach';
