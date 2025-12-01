import React from 'react';
import styles from './namelink.module.css';
import { NamelinkProps } from './namelink.types';

/**
 * Namelink component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.128Z
 */
export const Namelink: React.FC<NamelinkProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namelink} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namelink.displayName = 'Namelink';
