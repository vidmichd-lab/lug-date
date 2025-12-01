import React from 'react';
import styles from './Whattheatre.module.css';
import { WhattheatreProps } from './Whattheatre.types';

/**
 * Whattheatre component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.109Z
 */
export const Whattheatre: React.FC<WhattheatreProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whattheatre} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whattheatre.displayName = 'Whattheatre';
