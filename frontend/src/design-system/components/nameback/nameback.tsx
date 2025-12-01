import React from 'react';
import styles from './nameback.module.css';
import { NamebackProps } from './nameback.types';

/**
 * Nameback component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.099Z
 */
export const Nameback: React.FC<NamebackProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameback} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameback.displayName = 'Nameback';
