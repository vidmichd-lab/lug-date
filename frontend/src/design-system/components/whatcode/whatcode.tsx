import React from 'react';
import styles from './Whatcode.module.css';
import { WhatcodeProps } from './Whatcode.types';

/**
 * Whatcode component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.118Z
 */
export const Whatcode: React.FC<WhatcodeProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatcode} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatcode.displayName = 'Whatcode';
