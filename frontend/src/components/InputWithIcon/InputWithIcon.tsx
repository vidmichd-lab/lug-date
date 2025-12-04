/**
 * InputWithIcon component
 * Input field with icon on the left side
 */

import { FC } from 'react';
import { Icon } from '../Icon';
import styles from './InputWithIcon.module.css';
import type { InputWithIconProps } from './InputWithIcon.types';

const IconSvg: FC<{ type: InputWithIconProps['icon'] }> = ({ type }) => {
  // Map icon types to Icon component names
  type IconName = Parameters<typeof Icon>[0]['name'];
  const iconMap: Record<InputWithIconProps['icon'], IconName> = {
    briefcase: 'job',
    building: 'company',
    edit: 'edit',
  };

  const iconName = iconMap[type];
  if (!iconName) return null;

  return <Icon name={iconName} size={24} />;
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
