import React from 'react';
import styles from './nameeye.module.css';
import { NameeyeProps } from './nameeye.types';

/**
 * Nameeye component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.134Z
 */
export const Nameeye: React.FC<NameeyeProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameeye} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameeye.displayName = 'Nameeye';
