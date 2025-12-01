import React from 'react';
import styles from './Statenonactive.module.css';
import { StatenonactiveProps } from './Statenonactive.types';

/**
 * Statenonactive component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.106Z
 */
export const Statenonactive: React.FC<StatenonactiveProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.statenonactive} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Statenonactive.displayName = 'Statenonactive';
