import React from 'react';
import styles from './Whatfashion.module.css';
import { WhatfashionProps } from './Whatfashion.types';

/**
 * Whatfashion component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.111Z
 */
export const Whatfashion: React.FC<WhatfashionProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatfashion} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatfashion.displayName = 'Whatfashion';
