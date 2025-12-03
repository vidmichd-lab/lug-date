/**
 * InterestTag component
 * Tag/chip for selecting interests
 */

import { FC } from 'react';
import styles from './InterestTag.module.css';
import type { InterestTagProps } from './InterestTag.types';

export const InterestTag: FC<InterestTagProps> = ({
  interest,
  selected,
  onClick,
  disabled = false,
}) => {
  const IconComponent = interest.iconComponent;

  return (
    <button
      className={`${styles.interestTag} ${selected ? styles.interestTagSelected : ''}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-pressed={selected}
    >
      <span
        className={styles.interestIcon}
        style={selected ? undefined : { color: interest.color }}
      >
        <IconComponent />
      </span>
      <span>{interest.label}</span>
    </button>
  );
};
