import React from 'react';
import styles from './Nameadd.module.css';
import { NameaddProps } from './Nameadd.types';

/**
 * Nameadd component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.135Z
 */
export const Nameadd: React.FC<NameaddProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameadd} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameadd.displayName = 'Nameadd';
