import React from 'react';
import styles from './Property1Variant4.module.css';
import { Property1variant4Props } from './Property1Variant4.types';

/**
 * Property1variant4 component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.135Z
 */
export const Property1variant4: React.FC<Property1variant4Props> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.property1variant4} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Property1variant4.displayName = 'Property1variant4';
