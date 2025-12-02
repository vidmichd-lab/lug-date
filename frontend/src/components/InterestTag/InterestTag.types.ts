/**
 * Types for InterestTag component
 */

export interface Interest {
  id: string;
  label: string;
  iconComponent: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface InterestTagProps {
  interest: Interest;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}



