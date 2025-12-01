import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/admin/analytics`,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await api.get('/overview');
    return response.data.data;
  },

  // График регистраций пользователей
  getUsersChart: async (period: string = '7d'): Promise<UserChartData[]> => {
    const response = await api.get(`/users-chart?period=${period}`);
    return response.data.data;
  },

  // Топ событий
  getEventsTop: async (limit: number = 10): Promise<EventTopData[]> => {
    const response = await api.get(`/events-top?limit=${limit}`);
    return response.data.data;
  },

  // Воронка конверсии
  getFunnel: async (): Promise<FunnelData[]> => {
    const response = await api.get('/funnel');
    return response.data.data;
  },

  // Активность по дням недели
  getActivityHeatmap: async (): Promise<ActivityHeatmapData[]> => {
    const response = await api.get('/activity-heatmap');
    return response.data.data;
  },

  // Последние матчи
  getRecentMatches: async (limit: number = 10): Promise<RecentMatch[]> => {
    const response = await api.get(`/recent-matches?limit=${limit}`);
    return response.data.data;
  },
};

