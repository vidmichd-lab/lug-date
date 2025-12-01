import React from 'react';
import styles from './Whattravel.module.css';
import { WhattravelProps } from './Whattravel.types';

/**
 * Whattravel component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.112Z
 */
export const Whattravel: React.FC<WhattravelProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whattravel} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whattravel.displayName = 'Whattravel';
