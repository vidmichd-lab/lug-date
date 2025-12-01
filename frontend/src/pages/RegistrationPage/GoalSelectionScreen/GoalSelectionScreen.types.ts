/**
 * Types for GoalSelectionScreen component
 */

import type { Goal } from '../../../stores/registrationStore';

export interface GoalOption {
  id: Goal;
  label: string;
}

export interface GoalSelectionScreenProps {
  onNext: (goal: Goal) => void;
  onBack: () => void;
  initialGoal?: Goal;
}

