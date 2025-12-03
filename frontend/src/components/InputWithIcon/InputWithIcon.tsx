/**
 * InputWithIcon component
 * Input field with icon on the left side
 */

import { FC } from 'react';
import { CaseMinimalistic, Buildings, Pen } from '@solar-icons/react';
import styles from './InputWithIcon.module.css';
import type { InputWithIconProps } from './InputWithIcon.types';

const IconSvg: FC<{ type: InputWithIconProps['icon'] }> = ({ type }) => {
  const iconProps = {
    size: 24,
    color: 'currentColor' as const,
  };

  switch (type) {
    case 'briefcase':
      return <CaseMinimalistic {...iconProps} />;
    case 'building':
      return <Buildings {...iconProps} />;
    case 'edit':
      return <Pen {...iconProps} />;
    default:
      return null;
  }
};

export const InputWithIcon: FC<InputWithIconProps> = ({
  icon,
  placeholder,
  value,
  onChange,
  maxLength,
  type = 'text',
  rows = 3,
  className,
}) => {
  const isTextarea = type === 'textarea';

  return (
    <div className={`${styles.inputWrapper} ${className || ''}`}>
      <div className={`${styles.inputIcon} ${isTextarea ? styles.inputIconTextarea : ''}`}>
        <IconSvg type={icon} />
      </div>
      {isTextarea ? (
        <textarea
          className={styles.textarea}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            if (!maxLength || newValue.length <= maxLength) {
              onChange(newValue);
            }
          }}
          maxLength={maxLength}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            if (!maxLength || newValue.length <= maxLength) {
              onChange(newValue);
            }
          }}
          maxLength={maxLength}
        />
      )}
    </div>
  );
};
