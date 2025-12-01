import React from 'react';
import styles from './Whatcamp.module.css';
import { WhatcampProps } from './Whatcamp.types';

/**
 * Whatcamp component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.113Z
 */
export const Whatcamp: React.FC<WhatcampProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatcamp} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatcamp.displayName = 'Whatcamp';
