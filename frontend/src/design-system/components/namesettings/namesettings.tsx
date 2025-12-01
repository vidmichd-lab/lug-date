import React from 'react';
import styles from './namesettings.module.css';
import { NamesettingsProps } from './namesettings.types';

/**
 * Namesettings component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.134Z
 */
export const Namesettings: React.FC<NamesettingsProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.namesettings} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Namesettings.displayName = 'Namesettings';
