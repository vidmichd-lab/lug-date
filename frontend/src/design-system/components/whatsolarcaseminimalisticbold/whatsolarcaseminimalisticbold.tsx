import React from 'react';
import styles from './whatsolarcaseminimalisticbold.module.css';
import { WhatsolarcaseMinimalisticBoldProps } from './whatsolarcaseminimalisticbold.types';

/**
 * WhatsolarcaseMinimalisticBold component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.120Z
 */
export const WhatsolarcaseMinimalisticBold: React.FC<WhatsolarcaseMinimalisticBoldProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.whatsolarcaseminimalisticbold} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

WhatsolarcaseMinimalisticBold.displayName = 'WhatsolarcaseMinimalisticBold';
