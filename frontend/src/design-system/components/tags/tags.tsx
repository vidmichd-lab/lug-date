import React from 'react';
import styles from './Tags.module.css';
import { TagsProps } from './Tags.types';

/**
 * Tags component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.128Z
 */
export const Tags: React.FC<TagsProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.tags} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Tags.displayName = 'Tags';
