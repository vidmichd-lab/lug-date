/**
 * Types for DateOfBirthScreen component
 */

export interface DateOfBirthScreenProps {
  onNext: (date: { day: string; month: string; year: string }, showAge: boolean) => void;
  onBack: () => void;
  onExit: () => void;
  initialDate?: { day: string; month: string; year: string };
  initialShowAge?: boolean;
}

export type DateValidationError = 'invalid-date' | 'under-age' | 'future-date' | null;
