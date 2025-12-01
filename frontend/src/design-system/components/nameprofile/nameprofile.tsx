import React from 'react';
import styles from './nameprofile.module.css';
import { NameprofileProps } from './nameprofile.types';

/**
 * Nameprofile component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.106Z
 */
export const Nameprofile: React.FC<NameprofileProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameprofile} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameprofile.displayName = 'Nameprofile';
