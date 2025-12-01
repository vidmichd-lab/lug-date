import React from 'react';
import styles from './Frame52.module.css';
import { Frame52Props } from './Frame52.types';

/**
 * Frame52 component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.130Z
 */
export const Frame52: React.FC<Frame52Props> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.frame52} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Frame52.displayName = 'Frame52';
