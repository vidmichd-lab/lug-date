/**
 * Types for InterestsSelectorModal component
 */

export interface InterestsSelectorModalProps {
  isOpen: boolean;
  selectedInterests: string[];
  onSelect: (interestIds: string[]) => void;
  onClose: () => void;
}

