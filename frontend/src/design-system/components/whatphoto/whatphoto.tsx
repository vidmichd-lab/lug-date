import React from 'react';
import styles from './Whatphoto.module.css';
import { WhatphotoProps } from './Whatphoto.types';

/**
 * Whatphoto component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.110Z
 */
export const Whatphoto: React.FC<WhatphotoProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatphoto} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatphoto.displayName = 'Whatphoto';
