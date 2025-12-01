import React from 'react';
import styles from './Nameusers.module.css';
import { NameusersProps } from './Nameusers.types';

/**
 * Nameusers component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.124Z
 */
export const Nameusers: React.FC<NameusersProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameusers} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameusers.displayName = 'Nameusers';
