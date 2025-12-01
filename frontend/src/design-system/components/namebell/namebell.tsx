import React from 'react';
import styles from './Namebell.module.css';
import { NamebellProps } from './Namebell.types';

/**
 * Namebell component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.127Z
 */
export const Namebell: React.FC<NamebellProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namebell} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namebell.displayName = 'Namebell';
