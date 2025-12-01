import React from 'react';
import styles from './Statedone.module.css';
import { StatedoneProps } from './Statedone.types';

/**
 * Statedone component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.107Z
 */
export const Statedone: React.FC<StatedoneProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.statedone} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Statedone.displayName = 'Statedone';
