import React from 'react';
import styles from './whatweb3.module.css';
import { Whatweb3Props } from './whatweb3.types';

/**
 * Whatweb3 component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.115Z
 */
export const Whatweb3: React.FC<Whatweb3Props> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatweb3} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatweb3.displayName = 'Whatweb3';
