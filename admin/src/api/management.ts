/**
 * Management API client
 * CRUD operations for users, events, categories, and settings
 */

import axios from 'axios';

// Get API URL from runtime config or environment variable
const getApiUrl = (): string => {
  // Check runtime config (set in config.js or window.ADMIN_CONFIG)
  if (typeof window !== 'undefined' && (window as any).ADMIN_CONFIG?.API_URL) {
    return (window as any).ADMIN_CONFIG.API_URL;
  }
  // Fallback to environment variable
  return import.meta.env.VITE_API_URL || 'http://localhost:4000';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/admin/management`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Users
// ============================================

export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  bio?: string;
  age?: number;
  isBanned?: boolean;
  isModerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  bio?: string;
  age?: number;
  photoUrl?: string;
  isBanned?: boolean;
  isModerated?: boolean;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.data;
  },
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },
  update: async (id: string, updates: UserUpdate): Promise<User> => {
    const response = await api.patch(`/users/${id}`, updates);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// ============================================
// Events
// ============================================

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  location?: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreate {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  location?: string;
  date?: string;
}

export interface EventUpdate extends Partial<EventCreate> {}

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data.data;
  },
  create: async (event: EventCreate): Promise<Event> => {
    const response = await api.post('/events', event);
    return response.data.data;
  },
  update: async (id: string, updates: EventUpdate): Promise<Event> => {
    const response = await api.patch(`/events/${id}`, updates);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

// ============================================
// Categories
// ============================================

export interface Category {
  id: string;
  name: string;
  label: string;
  order?: number;
  isActive?: boolean;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },
  update: async (categories: Category[]): Promise<Category[]> => {
    const response = await api.put('/categories', categories);
    return response.data.data;
  },
};

// ============================================
// Settings
// ============================================

export interface Settings {
  appName: string;
  minAge: number;
  maxAge: number;
  cities: string[];
  goals: Array<{ id: string; label: string }>;
}

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const response = await api.get('/settings');
    return response.data.data;
  },
  update: async (settings: Settings): Promise<Settings> => {
    const response = await api.put('/settings', settings);
    return response.data.data;
  },
};

