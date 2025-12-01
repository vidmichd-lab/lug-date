import React from 'react';
import styles from './nameok.module.css';
import { NameokProps } from './nameok.types';

/**
 * Nameok component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.131Z
 */
export const Nameok: React.FC<NameokProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameok} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameok.displayName = 'Nameok';
