import React from 'react';
import styles from './namecards.module.css';
import { NamecardsProps } from './namecards.types';

/**
 * Namecards component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.127Z
 */
export const Namecards: React.FC<NamecardsProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namecards} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namecards.displayName = 'Namecards';
