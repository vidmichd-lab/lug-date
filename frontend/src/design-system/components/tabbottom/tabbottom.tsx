import React from 'react';
import styles from './tabbottom.module.css';
import { TabBottomProps } from './tabbottom.types';

/**
 * TabBottom component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.126Z
 */
export const TabBottom: React.FC<TabBottomProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.tabbottom} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

TabBottom.displayName = 'TabBottom';
