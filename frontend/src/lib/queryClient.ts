/**
 * React Query configuration
 * Caching and data fetching optimization
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: 2,
      // Refetch on window focus in production only
      refetchOnWindowFocus: import.meta.env.PROD,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
  // Feed queries
  feed: (type?: string, categories?: string[]) => ['feed', type, categories] as const,
  events: (categories?: string[]) => ['events', categories] as const,
  profiles: () => ['profiles'] as const,

  // User queries
  user: () => ['user'] as const,
  userProfile: (userId?: string) => ['user', 'profile', userId] as const,

  // Matches queries
  matches: (userId?: string) => ['matches', userId] as const,
  match: (matchId: string) => ['match', matchId] as const,

  // Likes queries
  likes: (userId?: string) => ['likes', userId] as const,
  like: (fromUserId: string, toUserId: string) => ['like', fromUserId, toUserId] as const,

  // Saved events queries
  savedEvents: (userId?: string) => ['savedEvents', userId] as const,

  // Notifications queries
  notifications: (userId?: string) => ['notifications', userId] as const,
};

/**
 * Cache invalidation helpers
 * Use these after mutations to ensure UI stays in sync
 */
export const invalidateQueries = {
  /**
   * Invalidate all feed-related queries
   */
  feed: () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
  },

  /**
   * Invalidate events queries
   */
  events: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  },

  /**
   * Invalidate profiles queries
   */
  profiles: () => {
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
  },

  /**
   * Invalidate user queries
   */
  user: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', userId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  },

  /**
   * Invalidate matches queries
   */
  matches: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['matches', userId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  },

  /**
   * Invalidate likes queries
   */
  likes: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['likes', userId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['likes'] });
    }
  },

  /**
   * Invalidate saved events queries
   */
  savedEvents: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['savedEvents', userId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['savedEvents'] });
    }
  },

  /**
   * Invalidate notifications queries
   */
  notifications: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  },

  /**
   * Invalidate all queries (use with caution)
   */
  all: () => {
    queryClient.invalidateQueries();
  },
};
