import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

// Автообновление каждые 30 секунд
const REFETCH_INTERVAL = 30000;

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 10000, // Данные считаются свежими 10 секунд
  });
};

export const useUsersChart = (period: string = '7d') => {
  return useQuery({
    queryKey: ['analytics', 'users-chart', period],
    queryFn: () => analyticsApi.getUsersChart(period),
    refetchInterval: REFETCH_INTERVAL,
  });
};

export const useEventsTop = (limit: number = 10) => {
  return useQuery({
    queryKey: ['analytics', 'events-top', limit],
    queryFn: () => analyticsApi.getEventsTop(limit),
    refetchInterval: REFETCH_INTERVAL,
  });
};

export const useFunnel = () => {
  return useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: analyticsApi.getFunnel,
    refetchInterval: REFETCH_INTERVAL,
  });
};

export const useActivityHeatmap = () => {
  return useQuery({
    queryKey: ['analytics', 'activity-heatmap'],
    queryFn: analyticsApi.getActivityHeatmap,
    refetchInterval: REFETCH_INTERVAL,
  });
};

export const useRecentMatches = (limit: number = 10) => {
  return useQuery({
    queryKey: ['analytics', 'recent-matches', limit],
    queryFn: () => analyticsApi.getRecentMatches(limit),
    refetchInterval: REFETCH_INTERVAL,
  });
};



