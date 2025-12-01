import React from 'react';
import styles from './Whatspace.module.css';
import { WhatspaceProps } from './Whatspace.types';

/**
 * Whatspace component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.117Z
 */
export const Whatspace: React.FC<WhatspaceProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatspace} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatspace.displayName = 'Whatspace';
