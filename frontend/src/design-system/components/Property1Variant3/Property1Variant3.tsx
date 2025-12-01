import React from 'react';
import styles from './Property1variant3.module.css';
import { Property1variant3Props } from './Property1variant3.types';

/**
 * Property1variant3 component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.136Z
 */
export const Property1variant3: React.FC<Property1variant3Props> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.property1variant3} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Property1variant3.displayName = 'Property1variant3';
