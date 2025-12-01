import React from 'react';
import styles from './namecompany.module.css';
import { NamecompanyProps } from './namecompany.types';

/**
 * Namecompany component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.106Z
 */
export const Namecompany: React.FC<NamecompanyProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namecompany} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namecompany.displayName = 'Namecompany';
