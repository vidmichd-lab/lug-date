import React from 'react';
import styles from './SizesStatedefault.module.css';
import { SizesStatedefaultProps } from './SizesStatedefault.types';

/**
 * SizesStatedefault component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.137Z
 */
export const SizesStatedefault: React.FC<SizesStatedefaultProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizesstatedefault} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizesStatedefault.displayName = 'SizesStatedefault';
