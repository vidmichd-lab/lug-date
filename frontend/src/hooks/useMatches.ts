/**
 * React Query hooks for matches
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import type { Match } from '@dating-app/shared';

interface MatchesResponse {
  data: Match[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Hook to fetch user matches
 */
export function useMatches(userId?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: queryKeys.matches(userId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await api.get<MatchesResponse>(`/api/v1/matches?${params.toString()}`);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch matches');
      }

      return response.data;
    },
    enabled: !!userId, // Only fetch if userId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes (matches change more frequently)
  });
}

/**
 * Hook to create a match
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId1,
      userId2,
      eventId,
    }: {
      userId1: string;
      userId2: string;
      eventId?: string;
    }) => {
      const response = await api.post<{ data: Match }>('/api/v1/matches', {
        userId1,
        userId2,
        eventId,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create match');
      }

      return response.data.data;
    },
    onSuccess: (match) => {
      // Invalidate matches queries
      invalidateQueries.matches();
      invalidateQueries.matches(match.userId1);
      invalidateQueries.matches(match.userId2);

      // Invalidate notifications (new match notification)
      invalidateQueries.notifications();
      invalidateQueries.notifications(match.userId1);
      invalidateQueries.notifications(match.userId2);

      // Optimistically add match to cache
      queryClient.setQueryData(
        queryKeys.matches(match.userId1),
        (old: MatchesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: [match, ...old.data],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );
    },
  });
}
