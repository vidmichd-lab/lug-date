import React from 'react';
import styles from './whatcharity.module.css';
import { WhatcharityProps } from './whatcharity.types';

/**
 * Whatcharity component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.120Z
 */
export const Whatcharity: React.FC<WhatcharityProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatcharity} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatcharity.displayName = 'Whatcharity';
