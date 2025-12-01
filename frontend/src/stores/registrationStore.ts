/**
 * Registration store using Zustand
 * Manages registration flow data (9 steps)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Gender = 'female' | 'male' | 'prefer-not-to-say';
export type Goal = 'find-friends' | 'networking' | 'dating' | 'serious-relationship' | 'other';

interface RegistrationData {
  firstName: string;
  dateOfBirth?: {
    day: string;
    month: string;
    year: string;
  };
  showAge?: boolean;
  cityId?: string;
  gender?: Gender;
  jobTitle?: string;
  company?: string;
  bio?: string;
  interests?: string[];
  goal?: Goal;
  photoUrl?: string;
  // TODO: Add other fields as we implement more steps
}

interface RegistrationState {
  currentStep: number;
  totalSteps: number;
  data: RegistrationData;
  setCurrentStep: (step: number) => void;
  updateData: (data: Partial<RegistrationData>) => void;
  resetRegistration: () => void;
}

const TOTAL_STEPS = 9;
const INITIAL_DATA: RegistrationData = {
  firstName: '',
  dateOfBirth: undefined,
  showAge: false,
  cityId: undefined,
  gender: undefined,
  jobTitle: undefined,
  company: undefined,
  bio: undefined,
  interests: undefined,
  goal: undefined,
  photoUrl: undefined,
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      currentStep: 1,
      totalSteps: TOTAL_STEPS,
      data: INITIAL_DATA,
      setCurrentStep: (step) => set({ currentStep: step }),
      updateData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
        })),
      resetRegistration: () =>
        set({
          currentStep: 1,
          data: INITIAL_DATA,
        }),
    }),
    {
      name: 'registration-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        data: state.data,
      }),
    }
  )
);

