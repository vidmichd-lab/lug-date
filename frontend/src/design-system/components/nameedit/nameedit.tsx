import React from 'react';
import styles from './nameedit.module.css';
import { NameeditProps } from './nameedit.types';

/**
 * Nameedit component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.107Z
 */
export const Nameedit: React.FC<NameeditProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameedit} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameedit.displayName = 'Nameedit';
