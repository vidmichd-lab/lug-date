import React from 'react';
import styles from './SizemStateactive.module.css';
import { SizemStateactiveProps } from './SizemStateactive.types';

/**
 * SizemStateactive component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.126Z
 */
export const SizemStateactive: React.FC<SizemStateactiveProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizemstateactive} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizemStateactive.displayName = 'SizemStateactive';
