/**
 * User store using Zustand
 * Manages current user state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@dating-app/shared';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearUser: () => set({ user: null, error: null }),
    }),
    {
      name: 'user-storage',
      // Only persist user data, not loading/error states
      partialize: (state) => ({ user: state.user }),
    }
  )
);

