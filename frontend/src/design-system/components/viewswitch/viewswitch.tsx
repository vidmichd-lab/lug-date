import React from 'react';
import styles from './Viewswitch.module.css';
import { ViewswitchProps } from './Viewswitch.types';

/**
 * Viewswitch component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.132Z
 */
export const Viewswitch: React.FC<ViewswitchProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.viewswitch} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Viewswitch.displayName = 'Viewswitch';
