import React from 'react';
import styles from './whatserial.module.css';
import { WhatserialProps } from './whatserial.types';

/**
 * Whatserial component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.113Z
 */
export const Whatserial: React.FC<WhatserialProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatserial} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatserial.displayName = 'Whatserial';
