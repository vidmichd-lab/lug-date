import React from 'react';
import styles from './Whatcinema.module.css';
import { WhatcinemaProps } from './Whatcinema.types';

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
