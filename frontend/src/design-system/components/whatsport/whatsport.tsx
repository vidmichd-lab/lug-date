import React from 'react';
import styles from './Whatsport.module.css';
import { WhatsportProps } from './Whatsport.types';

/**
 * Whatsport component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.112Z
 */
export const Whatsport: React.FC<WhatsportProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatsport} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatsport.displayName = 'Whatsport';
