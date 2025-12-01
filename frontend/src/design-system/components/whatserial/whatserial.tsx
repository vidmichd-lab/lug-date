import React from 'react';
import styles from './Whatserial.module.css';
import { WhatserialProps } from './Whatserial.types';

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
