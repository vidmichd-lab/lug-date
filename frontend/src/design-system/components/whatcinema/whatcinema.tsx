import React from 'react';
import styles from './whatcinema.module.css';
import { WhatcinemaProps } from './whatcinema.types';

/**
 * Whatcinema component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.108Z
 */
export const Whatcinema: React.FC<WhatcinemaProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatcinema} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatcinema.displayName = 'Whatcinema';
