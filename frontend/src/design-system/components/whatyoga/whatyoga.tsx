import React from 'react';
import styles from './Whatyoga.module.css';
import { WhatyogaProps } from './Whatyoga.types';

/**
 * Whatyoga component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.121Z
 */
export const Whatyoga: React.FC<WhatyogaProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatyoga} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatyoga.displayName = 'Whatyoga';
