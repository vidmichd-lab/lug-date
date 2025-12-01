/**
 * Types for InterestsScreen component
 */

export interface InterestsScreenProps {
  onNext: (interests: string[]) => void;
  onSkip: () => void;
  onBack: () => void;
  initialInterests?: string[];
}

