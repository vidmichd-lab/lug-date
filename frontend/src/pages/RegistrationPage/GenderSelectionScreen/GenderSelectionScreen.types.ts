/**
 * Types for GenderSelectionScreen component
 */

import type { Gender } from '../../../stores/registrationStore';

export interface GenderOption {
  id: Gender;
  label: string;
}

export interface GenderSelectionScreenProps {
  onNext: (gender: Gender) => void;
  onBack: () => void;
  initialGender?: Gender;
}
