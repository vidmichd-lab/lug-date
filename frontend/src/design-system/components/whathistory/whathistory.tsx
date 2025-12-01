import React from 'react';
import styles from './whathistory.module.css';
import { WhathistoryProps } from './whathistory.types';

/**
 * Whathistory component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.113Z
 */
export const Whathistory: React.FC<WhathistoryProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whathistory} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whathistory.displayName = 'Whathistory';
