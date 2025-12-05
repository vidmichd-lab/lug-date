/**
 * Onboarding store using Zustand
 * Manages onboarding state and completion status
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setCurrentStep: (step: number) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isCompleted: false,
      currentStep: 1,
      completeOnboarding: () => set({ isCompleted: true }),
      resetOnboarding: () => set({ isCompleted: false, currentStep: 1 }),
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({ isCompleted: state.isCompleted }),
    }
  )
);

