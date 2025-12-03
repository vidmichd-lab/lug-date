import React from 'react';
import styles from './nameback.module.css';
import { NamebackProps } from './nameback.types';

/**
 * Nameback component
 * Auto-generated from Figma
 * Uses SVG from Figma assets
 */
export const Nameback: React.FC<NamebackProps> = (props) => {
  const { children, className, ...rest } = props;

  // Use SVG from Figma - need to identify the correct SVG file
  // For now, using CSS-based icon as fallback
  return (
    <div className={`${styles.nameback} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Nameback.displayName = 'Nameback';
