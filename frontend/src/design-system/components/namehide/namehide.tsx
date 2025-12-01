import React from 'react';
import styles from './Namehide.module.css';
import { NamehideProps } from './Namehide.types';

/**
 * Namehide component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.135Z
 */
export const Namehide: React.FC<NamehideProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namehide} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namehide.displayName = 'Namehide';
