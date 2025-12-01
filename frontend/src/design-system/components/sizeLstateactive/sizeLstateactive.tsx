import React from 'react';
import styles from './SizelStateactive.module.css';
import { SizelStateactiveProps } from './SizelStateactive.types';

/**
 * SizelStateactive component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.105Z
 */
export const SizelStateactive: React.FC<SizelStateactiveProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizelstateactive} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizelStateactive.displayName = 'SizelStateactive';
