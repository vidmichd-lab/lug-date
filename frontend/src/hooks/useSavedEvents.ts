/**
 * React Query hooks for saved events
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import type { Event } from '@dating-app/shared';

interface SavedEventsResponse {
  data: Event[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Hook to fetch saved events
 */
export function useSavedEvents(userId?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: queryKeys.savedEvents(userId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await api.get<SavedEventsResponse>('/api/v1/saved-events', {
        requireAuth: true,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch saved events');
      }

      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to save/unsave an event
 */
export function useSaveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, action }: { eventId: string; action: 'save' | 'unsave' }) => {
      const response = await api.post(`/api/v1/saved-events`, {
        eventId,
        action,
      });

      if (!response.success) {
        throw new Error(response.error?.message || `Failed to ${action} event`);
      }

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate saved events
      invalidateQueries.savedEvents();

      // Optimistically update cache
      queryClient.setQueryData(queryKeys.savedEvents(), (old: SavedEventsResponse | undefined) => {
        if (!old) return old;

        if (variables.action === 'save') {
          // Add event to saved (would need to fetch event details)
          invalidateQueries.savedEvents();
        } else {
          // Remove event from saved
          return {
            ...old,
            data: old.data.filter((event) => event.id !== variables.eventId),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }

        return old;
      });
    },
  });
}
