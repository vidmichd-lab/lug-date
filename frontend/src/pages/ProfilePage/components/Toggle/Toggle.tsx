/**
 * Toggle component
 * Switch toggle for settings
 */

import { FC } from 'react';
import styles from './Toggle.module.css';
import type { ToggleProps } from './Toggle.types';

export const Toggle: FC<ToggleProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <div className={styles.toggleContainer}>
      {label && <span className={styles.toggleLabel}>{label}</span>}
      <button
        className={`${styles.toggleSwitch} ${checked ? styles.toggleSwitchActive : ''} ${
          disabled ? styles.toggleSwitchDisabled : ''
        }`}
        onClick={() => !disabled && onChange(!checked)}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
};



