/**
 * Types for NameInputScreen component
 */

export interface NameInputScreenProps {
  onNext: (name: string) => void;
  onBack: () => void;
  initialValue?: string;
}

export type NameValidationError = 'empty' | 'invalidChars' | 'tooLong' | null;

