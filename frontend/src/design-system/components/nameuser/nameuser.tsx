import React from 'react';
import styles from './Nameuser.module.css';
import { NameuserProps } from './Nameuser.types';

/**
 * Nameuser component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.122Z
 */
export const Nameuser: React.FC<NameuserProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.nameuser} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameuser.displayName = 'Nameuser';
