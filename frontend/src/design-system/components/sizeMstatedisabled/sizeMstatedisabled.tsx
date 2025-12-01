import React from 'react';
import styles from './sizeMstatedisabled.module.css';
import { SizemStatedisabledProps } from './sizeMstatedisabled.types';

/**
 * SizemStatedisabled component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.140Z
 */
export const SizemStatedisabled: React.FC<SizemStatedisabledProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizemstatedisabled} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizemStatedisabled.displayName = 'SizemStatedisabled';
