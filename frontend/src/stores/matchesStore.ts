/**
 * Matches store using Zustand
 * Manages matches state
 */

import { create } from 'zustand';
import type { Match } from '@dating-app/shared';

interface MatchesState {
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  removeMatch: (matchId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearMatches: () => void;
}

export const useMatchesStore = create<MatchesState>((set) => ({
  matches: [],
  isLoading: false,
  error: null,
  setMatches: (matches) => set({ matches, error: null }),
  addMatch: (match) =>
    set((state) => ({
      matches: [...state.matches, match],
      error: null,
    })),
  removeMatch: (matchId) =>
    set((state) => ({
      matches: state.matches.filter((m) => m.id !== matchId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearMatches: () => set({ matches: [], error: null }),
}));

