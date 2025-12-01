import React from 'react';
import styles from './Namenext.module.css';
import { NamenextProps } from './Namenext.types';

/**
 * Namenext component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.105Z
 */
export const Namenext: React.FC<NamenextProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namenext} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namenext.displayName = 'Namenext';
