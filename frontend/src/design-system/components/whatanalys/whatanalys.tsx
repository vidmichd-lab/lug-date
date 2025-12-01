import React from 'react';
import styles from './Whatanalys.module.css';
import { WhatanalysProps } from './Whatanalys.types';

/**
 * Whatanalys component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.118Z
 */
export const Whatanalys: React.FC<WhatanalysProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatanalys} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatanalys.displayName = 'Whatanalys';
