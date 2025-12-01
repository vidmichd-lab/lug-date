import React from 'react';
import styles from './Whatlang.module.css';
import { WhatlangProps } from './Whatlang.types';

/**
 * Whatlang component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.112Z
 */
export const Whatlang: React.FC<WhatlangProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatlang} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatlang.displayName = 'Whatlang';
