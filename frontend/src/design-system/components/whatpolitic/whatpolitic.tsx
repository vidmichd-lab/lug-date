import React from 'react';
import styles from './whatpolitic.module.css';
import { WhatpoliticProps } from './whatpolitic.types';

/**
 * Whatpolitic component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.114Z
 */
export const Whatpolitic: React.FC<WhatpoliticProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatpolitic} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatpolitic.displayName = 'Whatpolitic';
