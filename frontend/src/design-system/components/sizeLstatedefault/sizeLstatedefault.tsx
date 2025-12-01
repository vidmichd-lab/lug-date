import React from 'react';
import styles from './SizelStatedefault.module.css';
import { SizelStatedefaultProps } from './SizelStatedefault.types';

/**
 * SizelStatedefault component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.101Z
 */
export const SizelStatedefault: React.FC<SizelStatedefaultProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizelstatedefault} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizelStatedefault.displayName = 'SizelStatedefault';
