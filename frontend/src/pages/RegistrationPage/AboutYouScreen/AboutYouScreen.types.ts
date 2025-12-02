/**
 * Types for AboutYouScreen component
 */

export interface AboutYouFormData {
  jobTitle: string;
  company: string;
  bio: string;
}

export interface AboutYouScreenProps {
  onNext: (data: AboutYouFormData) => void;
  onSkip: () => void;
  onBack: () => void;
  initialData?: Partial<AboutYouFormData>;
}
