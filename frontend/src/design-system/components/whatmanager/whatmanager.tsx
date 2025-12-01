import React from 'react';
import styles from './whatmanager.module.css';
import { WhatmanagerProps } from './whatmanager.types';

/**
 * Whatmanager component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.119Z
 */
export const Whatmanager: React.FC<WhatmanagerProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatmanager} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatmanager.displayName = 'Whatmanager';
