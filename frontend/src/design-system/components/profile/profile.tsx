import React from 'react';
import styles from './profile.module.css';
import { ProfileProps } from './profile.types';

/**
 * Profile component
 * Auto-generated from Figma
 * Added: 2025-12-01T12:15:51.124Z
 */
export const Profile: React.FC<ProfileProps> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={`${styles.profile} ${className || ''}`} {...rest}>
      {children}
    </div>
  );
};

Profile.displayName = 'Profile';
