import React from 'react';
import styles from './statedefault.module.css';
import { StatedefaultProps } from './statedefault.types';

/**
 * Statedefault component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.140Z
 */
export const Statedefault: React.FC<StatedefaultProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.statedefault} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Statedefault.displayName = 'Statedefault';
