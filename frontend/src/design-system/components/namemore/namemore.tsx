import React from 'react';
import styles from './Namemore.module.css';
import { NamemoreProps } from './Namemore.types';

/**
 * Namemore component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.124Z
 */
export const Namemore: React.FC<NamemoreProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namemore} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namemore.displayName = 'Namemore';
