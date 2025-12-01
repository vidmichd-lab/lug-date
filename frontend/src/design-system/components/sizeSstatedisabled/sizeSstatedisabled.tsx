import React from 'react';
import styles from './SizesStatedisabled.module.css';
import { SizesStatedisabledProps } from './SizesStatedisabled.types';

/**
 * SizesStatedisabled component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.141Z
 */
export const SizesStatedisabled: React.FC<SizesStatedisabledProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizesstatedisabled} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizesStatedisabled.displayName = 'SizesStatedisabled';
