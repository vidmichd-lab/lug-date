import React from 'react';
import styles from './nametg.module.css';
import { NametgProps } from './nametg.types';

/**
 * Nametg component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.104Z
 */
export const Nametg: React.FC<NametgProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nametg} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nametg.displayName = 'Nametg';
