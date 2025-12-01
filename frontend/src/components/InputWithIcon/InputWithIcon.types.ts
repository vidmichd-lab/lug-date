/**
 * Types for InputWithIcon component
 */

export type IconType = 'briefcase' | 'building' | 'edit';

export interface InputWithIconProps {
  icon: IconType;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  type?: 'text' | 'textarea';
  rows?: number;
  className?: string;
}

