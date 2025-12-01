import React from 'react';
import styles from './namereport.module.css';
import { NamereportProps } from './namereport.types';

/**
 * Namereport component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.137Z
 */
export const Namereport: React.FC<NamereportProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namereport} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namereport.displayName = 'Namereport';
