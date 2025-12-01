import React from 'react';
import styles from './Whatcook.module.css';
import { WhatcookProps } from './Whatcook.types';

/**
 * Whatcook component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.110Z
 */
export const Whatcook: React.FC<WhatcookProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatcook} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatcook.displayName = 'Whatcook';
