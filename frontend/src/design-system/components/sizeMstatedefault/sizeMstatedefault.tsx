import React from 'react';
import styles from './sizeMstatedefault.module.css';
import { SizemStatedefaultProps } from './sizeMstatedefault.types';

/**
 * SizemStatedefault component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.125Z
 */
export const SizemStatedefault: React.FC<SizemStatedefaultProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizemstatedefault} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizemStatedefault.displayName = 'SizemStatedefault';
