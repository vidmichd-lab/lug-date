import React from 'react';
import styles from './namejob.module.css';
import { NamejobProps } from './namejob.types';

/**
 * Namejob component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.106Z
 */
export const Namejob: React.FC<NamejobProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namejob} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namejob.displayName = 'Namejob';
