import React from 'react';
import styles from './Stateactive.module.css';
import { StateactiveProps } from './Stateactive.types';

/**
 * Stateactive component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.140Z
 */
export const Stateactive: React.FC<StateactiveProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.stateactive} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Stateactive.displayName = 'Stateactive';
