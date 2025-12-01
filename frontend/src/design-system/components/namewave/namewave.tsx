import React from 'react';
import styles from './Namewave.module.css';
import { NamewaveProps } from './Namewave.types';

/**
 * Namewave component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.126Z
 */
export const Namewave: React.FC<NamewaveProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namewave} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namewave.displayName = 'Namewave';
