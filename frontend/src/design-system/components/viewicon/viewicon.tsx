import React from 'react';
import styles from './Viewicon.module.css';
import { ViewiconProps } from './Viewicon.types';

/**
 * Viewicon component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.136Z
 */
export const Viewicon: React.FC<ViewiconProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.viewicon} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Viewicon.displayName = 'Viewicon';
