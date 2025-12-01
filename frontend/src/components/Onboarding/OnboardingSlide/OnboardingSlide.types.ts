/**
 * Types for OnboardingSlide component
 */

export interface OnboardingSlideProps {
  step: number;
  title: string;
  subtitle: string;
  illustration?: string | null;
  buttonText: string;
  onNext: () => void;
  totalSteps: number;
}

