import React from 'react';
import styles from './nameupdate.module.css';
import { NameupdateProps } from './nameupdate.types';

/**
 * Nameupdate component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.123Z
 */
export const Nameupdate: React.FC<NameupdateProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameupdate} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameupdate.displayName = 'Nameupdate';
