import React from 'react';
import styles from './whatart.module.css';
import { WhatartProps } from './whatart.types';

/**
 * Whatart component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.108Z
 */
export const Whatart: React.FC<WhatartProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatart} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatart.displayName = 'Whatart';
