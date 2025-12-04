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

const API_BASE_URL = getApiUrl().replace(/\/$/, ''); // Remove trailing slash

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/admin/management`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding auth token to request:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...',
        hasAuthHeader: !!config.headers.Authorization,
        authHeaderPrefix: config.headers.Authorization?.substring(0, 30) + '...',
      });
    } else {
      console.warn('⚠️ No auth token found in localStorage for request:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        availableKeys: Object.keys(localStorage),
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Even if status is 200, check if success is false
    if (response.data && response.data.success === false) {
      // Create an error object that will be caught by our methods
      const error: any = new Error(response.data.error?.message || 'Request failed');
      error.response = {
        status: response.status,
        data: response.data,
      };
      error.config = response.config;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = error.response?.data?.error?.message;
      const responseData = error.response?.data;

      console.error('❌ 403 Forbidden:', {
        code: errorCode,
        message: errorMessage,
        url: error.config?.url,
        method: error.config?.method,
        hasToken: !!localStorage.getItem('admin_token'),
        tokenPrefix: localStorage.getItem('admin_token')?.substring(0, 20),
        responseStatus: error.response?.status,
        responseData: responseData,
        responseHeaders: error.response?.headers,
        requestHeaders: error.config?.headers,
        // Check if it's a CORS error
        isCorsError: errorCode === 'CORS_ERROR' || errorMessage?.includes('CORS'),
        // Check if it's a rate limit error
        isRateLimitError: errorCode === 'RATE_LIMIT_EXCEEDED',
        // Full response for debugging
        fullResponse: JSON.stringify(responseData, null, 2),
      });

      // Расширенное логирование для диагностики
      console.group('🔍 Детальная диагностика 403');
      console.error('📤 Request:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
      });
      const storedToken = localStorage.getItem('admin_token');
      console.error('🔑 Token Info:', {
        hasToken: !!storedToken,
        tokenLength: storedToken?.length,
        tokenPrefix: storedToken?.substring(0, 20) + '...',
        tokenSuffix: storedToken ? '...' + storedToken.substring(storedToken.length - 10) : null,
        // НЕ логируем полный токен для безопасности
      });
      console.error('📥 Response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        dataType: typeof error.response?.data,
        dataString: JSON.stringify(error.response?.data),
        headers: error.response?.headers,
      });
      console.error('📤 Request Headers:', error.config?.headers);
      console.error('🔍 Full Error Object:', error);
      console.error('📋 Response Data Structure:', {
        hasSuccess: error.response?.data && 'success' in error.response.data,
        hasError: error.response?.data && 'error' in error.response.data,
        hasData: error.response?.data && 'data' in error.response.data,
        keys: error.response?.data ? Object.keys(error.response.data) : [],
        fullResponse: error.response?.data,
      });
      console.groupEnd();

      // Не разлогинивать автоматически - дать возможность посмотреть логи
      // Пользователь может разлогиниться вручную через кнопку
      if (errorCode === 'UNAUTHORIZED' || !errorCode) {
        console.error('❌ Unauthorized access detected');
        console.error(
          '⚠️ Token will NOT be cleared automatically. You can clear it manually if needed.'
        );
        console.error('💡 To logout manually, run: localStorage.clear(); location.reload();');
        // НЕ очищаем токен автоматически - даем возможность посмотреть логи
        // localStorage.removeItem('admin_token');
        // window.location.reload();
      }

      return Promise.reject(error);
    }

    // Log error for debugging
    if (error.response) {
      // If response has data with success: false, extract the error message
      if (error.response.data && error.response.data.success === false) {
        // This is a valid API error response, keep it as is
        const apiError: any = new Error(error.response.data.error?.message || 'Request failed');
        apiError.response = error.response;
        apiError.config = error.config;
        return Promise.reject(apiError);
      }
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error('API Request Error:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

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
  getAll: async (
    limit?: number,
    offset?: number
  ): Promise<{ data: User[]; pagination?: { total: number; limit: number; offset: number } }> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    const queryString = params.toString();
    const url = `/users${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);

    // Backend returns { success: true, data: [...], pagination: {...} }
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
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
  getAll: async (
    limit?: number,
    offset?: number
  ): Promise<{ data: Event[]; pagination?: { total: number; limit: number; offset: number } }> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    const queryString = params.toString();
    const url = `/events${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);

    // Backend returns { success: true, data: [...], pagination: {...} }
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
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
  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Create a separate axios instance for file uploads without default JSON headers
      // Axios will automatically set Content-Type with boundary for FormData
      const uploadApi = axios.create({
        baseURL: `${API_BASE_URL}/api/admin/management`,
        timeout: 60000, // 60 seconds timeout for file uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // Add auth token to upload requests
      const token = localStorage.getItem('admin_token');
      if (token) {
        uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await uploadApi.post('/events/upload-image', formData);
      return response.data.data;
    } catch (error: any) {
      // Log detailed error information
      console.error('Upload error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
        code: error?.code,
      });
      throw error;
    }
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
