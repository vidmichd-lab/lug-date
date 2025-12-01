import React from 'react';
import styles from './Whatdesign.module.css';
import { WhatdesignProps } from './Whatdesign.types';

/**
 * Whatdesign component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.109Z
 */
export const Whatdesign: React.FC<WhatdesignProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatdesign} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatdesign.displayName = 'Whatdesign';
