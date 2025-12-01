import React from 'react';
import styles from './sizeLstatedisabled.module.css';
import { SizelStatedisabledProps } from './sizeLstatedisabled.types';

/**
 * SizelStatedisabled component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.105Z
 */
export const SizelStatedisabled: React.FC<SizelStatedisabledProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizelstatedisabled} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizelStatedisabled.displayName = 'SizelStatedisabled';
