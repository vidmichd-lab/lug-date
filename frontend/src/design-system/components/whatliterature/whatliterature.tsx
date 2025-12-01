import React from 'react';
import styles from './whatliterature.module.css';
import { WhatliteratureProps } from './whatliterature.types';

/**
 * Whatliterature component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.108Z
 */
export const Whatliterature: React.FC<WhatliteratureProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatliterature} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Whatliterature.displayName = 'Whatliterature';
