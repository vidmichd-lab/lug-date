import React from 'react';
import styles from './whatai.module.css';
import { WhataiProps } from './whatai.types';

/**
 * Whatai component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.121Z
 */
export const Whatai: React.FC<WhataiProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatai} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatai.displayName = 'Whatai';
