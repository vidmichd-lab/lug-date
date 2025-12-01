import React from 'react';
import styles from './whatplants.module.css';
import { WhatplantsProps } from './whatplants.types';

/**
 * Whatplants component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.119Z
 */
export const Whatplants: React.FC<WhatplantsProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatplants} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatplants.displayName = 'Whatplants';
