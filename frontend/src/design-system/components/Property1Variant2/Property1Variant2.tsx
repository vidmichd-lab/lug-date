import React from 'react';
import styles from './Property1variant2.module.css';
import { Property1variant2Props } from './Property1variant2.types';

/**
 * Property1variant2 component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.141Z
 */
export const Property1variant2: React.FC<Property1variant2Props> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.property1variant2} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Property1variant2.displayName = 'Property1variant2';
