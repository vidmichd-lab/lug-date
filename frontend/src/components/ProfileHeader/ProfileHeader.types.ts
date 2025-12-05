/**
 * Types for ProfileHeader component
 */

export interface ProfileHeaderProps {
  showBackButton?: boolean;
  title: string;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

