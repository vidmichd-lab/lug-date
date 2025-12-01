import React from 'react';
import styles from './Whatpaint.module.css';
import { WhatpaintProps } from './Whatpaint.types';

/**
 * Whatpaint component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.122Z
 */
export const Whatpaint: React.FC<WhatpaintProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatpaint} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatpaint.displayName = 'Whatpaint';
