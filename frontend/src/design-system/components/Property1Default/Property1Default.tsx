import React from 'react';
import styles from './Property1Default.module.css';
import { Property1defaultProps } from './Property1Default.types';

/**
 * Property1default component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.141Z
 */
export const Property1default: React.FC<Property1defaultProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.property1default} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Property1default.displayName = 'Property1default';
