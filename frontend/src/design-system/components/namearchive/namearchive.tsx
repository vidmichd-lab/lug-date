import React from 'react';
import styles from './namearchive.module.css';
import { NamearchiveProps } from './namearchive.types';

/**
 * Namearchive component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.131Z
 */
export const Namearchive: React.FC<NamearchiveProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namearchive} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namearchive.displayName = 'Namearchive';
