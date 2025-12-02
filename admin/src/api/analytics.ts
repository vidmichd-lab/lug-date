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
  baseURL: `${API_BASE_URL}/api/admin`,
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
      console.log('🔑 Adding auth token to analytics request:', config.url);
    } else {
      console.warn('⚠️ No auth token found in localStorage for analytics request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 403 Unauthorized - clear token and redirect to login
    if (error.response?.status === 403 && error.response?.data?.error?.code === 'UNAUTHORIZED') {
      console.warn('⚠️ Unauthorized access in analytics, clearing token and redirecting to login');
      localStorage.removeItem('admin_token');
      window.location.reload();
      return Promise.reject(error);
    }

    // Log error for debugging
    if (error.response) {
      console.error('Analytics API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    } else if (error.request) {
      console.error('Analytics API Request Error:', error.request);
    } else {
      console.error('Analytics API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface AnalyticsOverview {
  users: {
    total: number;
    newThisWeek: number;
    growth: number; // процент роста
  };
  events: {
    active: number;
    past: number;
    total: number;
  };
  matches: {
    total: number;
    today: number;
    thisWeek: number;
    growth: number;
  };
  conversionRate: {
    likesToMatches: number; // процент
    viewsToLikes: number;
    viewsToMatches: number;
  };
  onlineUsers: number;
}

export interface UserChartData {
  date: string;
  registrations: number;
  active: number;
}

export interface EventTopData {
  id: string;
  title: string;
  likes: number;
  views: number;
  matches: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface ActivityHeatmapData {
  day: string;
  hour: number;
  value: number;
}

export interface RecentMatch {
  id: string;
  user1: {
    id: string;
    name: string;
    avatar?: string;
  };
  user2: {
    id: string;
    name: string;
    avatar?: string;
  };
  eventId?: string;
  eventTitle?: string;
  createdAt: string;
}

export const analyticsApi = {
  // Общая статистика
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await api.get('/analytics/overview');
    return response.data.data;
  },

  // График регистраций пользователей
  getUsersChart: async (period: string = '7d'): Promise<UserChartData[]> => {
    const response = await api.get(`/analytics/users-chart?period=${period}`);
    return response.data.data;
  },

  // Топ событий
  getEventsTop: async (limit: number = 10): Promise<EventTopData[]> => {
    const response = await api.get(`/analytics/events-top?limit=${limit}`);
    return response.data.data;
  },

  // Воронка конверсии
  getFunnel: async (): Promise<FunnelData[]> => {
    const response = await api.get('/analytics/funnel');
    return response.data.data;
  },

  // Активность по дням недели
  getActivityHeatmap: async (): Promise<ActivityHeatmapData[]> => {
    const response = await api.get('/analytics/activity-heatmap');
    return response.data.data;
  },

  // Последние матчи
  getRecentMatches: async (limit: number = 10): Promise<RecentMatch[]> => {
    const response = await api.get(`/analytics/recent-matches?limit=${limit}`);
    return response.data.data;
  },
};
