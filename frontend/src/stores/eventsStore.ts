/**
 * Events store using Zustand
 * Manages events state
 */

import { create } from 'zustand';
import type { Event } from '@dating-app/shared';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  removeEvent: (eventId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearEvents: () => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,
  setEvents: (events) => set({ events, error: null }),
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
      error: null,
    })),
  updateEvent: (eventId, updates) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, ...updates } : e
      ),
    })),
  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== eventId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearEvents: () => set({ events: [], currentEvent: null, error: null }),
}));

