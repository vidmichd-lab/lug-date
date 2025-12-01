import React from 'react';
import styles from './Namelinkout.module.css';
import { NamelinkoutProps } from './Namelinkout.types';

/**
 * Namelinkout component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.137Z
 */
export const Namelinkout: React.FC<NamelinkoutProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namelinkout} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namelinkout.displayName = 'Namelinkout';
