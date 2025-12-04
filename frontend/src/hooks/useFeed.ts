/**
 * React Query hook for feed data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import type { Card } from '../pages/HomePage/utils';

interface FeedParams {
  type?: 'events' | 'profiles';
  categories?: string[];
  limit?: number;
  offset?: number;
}

interface FeedResponse {
  cards: Card[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Hook to fetch feed data
 */
export function useFeed(params: FeedParams = {}, options?: { requireAuth?: boolean }) {
  const { type = 'events', categories = [], limit = 20, offset = 0 } = params;
  const { requireAuth = false } = options || {};

  return useQuery({
    queryKey: queryKeys.feed(type, categories),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('type', type);
      categories.forEach((cat) => queryParams.append('category', cat));
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const response = await api.get<FeedResponse>(`/api/v1/feed?${queryParams.toString()}`, {
        requireAuth,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch feed');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to like/dislike a profile or event
 */
export function useLikeAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      cardId,
      cardType,
    }: {
      action: 'like' | 'dislike';
      cardId: string;
      cardType: 'event' | 'profile';
    }) => {
      const response = await api.post(
        '/api/v1/feed/action',
        {
          cardId,
          cardType,
          action,
        },
        {
          requireAuth: true,
        }
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to perform action');
      }

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate feed to refresh cards
      invalidateQueries.feed();

      // If it was a like, invalidate matches (might have created a match)
      if (variables.action === 'like') {
        invalidateQueries.matches();
        invalidateQueries.likes();
      }

      // Optimistically update feed cache - remove the card that was swiped
      queryClient.setQueriesData<FeedResponse>({ queryKey: queryKeys.feed() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          cards: old.cards.filter((card) => card.id !== variables.cardId),
        };
      });
    },
  });
}
