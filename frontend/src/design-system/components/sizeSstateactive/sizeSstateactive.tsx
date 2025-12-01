import React from 'react';
import styles from './SizesStateactive.module.css';
import { SizesStateactiveProps } from './SizesStateactive.types';

/**
 * SizesStateactive component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.141Z
 */
export const SizesStateactive: React.FC<SizesStateactiveProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.sizesstateactive} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

SizesStateactive.displayName = 'SizesStateactive';
