import React from 'react';
import styles from './Namewrong.module.css';
import { NamewrongProps } from './Namewrong.types';

/**
 * Namewrong component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.125Z
 */
export const Namewrong: React.FC<NamewrongProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namewrong} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namewrong.displayName = 'Namewrong';
