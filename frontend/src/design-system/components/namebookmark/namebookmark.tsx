import React from 'react';
import styles from './namebookmark.module.css';
import { NamebookmarkProps } from './namebookmark.types';

/**
 * Namebookmark component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.127Z
 */
export const Namebookmark: React.FC<NamebookmarkProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namebookmark} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namebookmark.displayName = 'Namebookmark';
