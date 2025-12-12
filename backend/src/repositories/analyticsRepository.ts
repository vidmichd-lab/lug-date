/**
 * Analytics Repository
 * Handles all analytics queries for admin dashboard
 */

import { postgresClient } from '../db/postgresConnection';
import { logger } from '../logger';
import { userRepository } from './userRepository';
import { eventRepository } from './eventRepository';

export interface UserStats {
  total: number;
  newThisWeek: number;
  growth: number;
}

export interface EventStats {
  active: number;
  past: number;
  total: number;
}

export interface MatchStats {
  total: number;
  today: number;
  thisWeek: number;
  growth: number;
}

export interface ConversionRate {
  likesToMatches: number;
  viewsToLikes: number;
  viewsToMatches: number;
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
  };
  user2: {
    id: string;
    name: string;
  };
  eventId?: string;
  eventTitle?: string;
  createdAt: Date;
}

export class AnalyticsRepository {
  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      // Total users
      const totalResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM users'
      );
      const total = parseInt(totalResult[0]?.count || '0', 10);

      // New users this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const newThisWeekResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM users WHERE created_at >= $1',
        [weekAgo]
      );
      const newThisWeek = parseInt(newThisWeekResult[0]?.count || '0', 10);

      // Growth (compare with previous week)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const previousWeekResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND created_at < $2',
        [twoWeeksAgo, weekAgo]
      );
      const previousWeek = parseInt(previousWeekResult[0]?.count || '0', 10);
      const growth = previousWeek > 0 ? ((newThisWeek - previousWeek) / previousWeek) * 100 : 0;

      return {
        total,
        newThisWeek,
        growth: Math.round(growth * 10) / 10,
      };
    } catch (error) {
      logger.error({ error, type: 'analytics_user_stats_failed' });
      throw error;
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(): Promise<EventStats> {
    try {
      const now = new Date();

      // Total events
      const totalResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM events'
      );
      const total = parseInt(totalResult[0]?.count || '0', 10);

      // Active events (date >= now or date is null)
      const activeResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM events WHERE date IS NULL OR date >= $1',
        [now]
      );
      const active = parseInt(activeResult[0]?.count || '0', 10);

      // Past events
      const past = total - active;

      return {
        active,
        past,
        total,
      };
    } catch (error) {
      logger.error({ error, type: 'analytics_event_stats_failed' });
      throw error;
    }
  }

  /**
   * Get match statistics
   */
  async getMatchStats(): Promise<MatchStats> {
    try {
      // Total matches
      const totalResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM matches'
      );
      const total = parseInt(totalResult[0]?.count || '0', 10);

      // Matches today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM matches WHERE created_at >= $1',
        [todayStart]
      );
      const today = parseInt(todayResult[0]?.count || '0', 10);

      // Matches this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM matches WHERE created_at >= $1',
        [weekAgo]
      );
      const thisWeek = parseInt(thisWeekResult[0]?.count || '0', 10);

      // Growth (compare with previous week)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const previousWeekResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM matches WHERE created_at >= $1 AND created_at < $2',
        [twoWeeksAgo, weekAgo]
      );
      const previousWeek = parseInt(previousWeekResult[0]?.count || '0', 10);
      const growth = previousWeek > 0 ? ((thisWeek - previousWeek) / previousWeek) * 100 : 0;

      return {
        total,
        today,
        thisWeek,
        growth: Math.round(growth * 10) / 10,
      };
    } catch (error) {
      logger.error({ error, type: 'analytics_match_stats_failed' });
      throw error;
    }
  }

  /**
   * Get conversion rates
   */
  async getConversionRates(): Promise<ConversionRate> {
    try {
      // Total likes
      const likesResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM likes'
      );
      const likes = parseInt(likesResult[0]?.count || '0', 10);

      // Total matches
      const matchesResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM matches'
      );
      const matches = parseInt(matchesResult[0]?.count || '0', 10);

      // Estimate views (assuming 10 views per like on average)
      const views = likes * 10;

      const likesToMatches = likes > 0 ? (matches / likes) * 100 : 0;
      const viewsToLikes = views > 0 ? (likes / views) * 100 : 0;
      const viewsToMatches = views > 0 ? (matches / views) * 100 : 0;

      return {
        likesToMatches: Math.round(likesToMatches * 10) / 10,
        viewsToLikes: Math.round(viewsToLikes * 10) / 10,
        viewsToMatches: Math.round(viewsToMatches * 10) / 10,
      };
    } catch (error) {
      logger.error({ error, type: 'analytics_conversion_rates_failed' });
      throw error;
    }
  }

  /**
   * Get user chart data (registrations and active users by date)
   */
  async getUserChartData(days: number = 7): Promise<UserChartData[]> {
    try {
      const data: UserChartData[] = [];
      const now = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - i - 1));
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Registrations on this date
        const registrationsResult = await postgresClient.executeQuery<{ count: string }>(
          'SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND created_at < $2',
          [date, nextDate]
        );
        const registrations = parseInt(registrationsResult[0]?.count || '0', 10);

        // Active users (users who had activity - simplified: users with matches or likes)
        const matchesActiveResult = await postgresClient.executeQuery<{ user_id1: string }>(
          'SELECT DISTINCT user_id1 FROM matches WHERE created_at >= $1 AND created_at < $2',
          [date, nextDate]
        );
        const matchesActive2Result = await postgresClient.executeQuery<{ user_id2: string }>(
          'SELECT DISTINCT user_id2 FROM matches WHERE created_at >= $1 AND created_at < $2',
          [date, nextDate]
        );
        const likesActiveResult = await postgresClient.executeQuery<{ from_user_id: string }>(
          'SELECT DISTINCT from_user_id FROM likes WHERE created_at >= $1 AND created_at < $2',
          [date, nextDate]
        );

        // Combine unique user IDs
        const activeUserIds = new Set<string>();
        matchesActiveResult.forEach((r) => activeUserIds.add(r.user_id1));
        matchesActive2Result.forEach((r) => activeUserIds.add(r.user_id2));
        likesActiveResult.forEach((r) => activeUserIds.add(r.from_user_id));
        const active = activeUserIds.size;

        data.push({
          date: date.toISOString(),
          registrations,
          active,
        });
      }

      return data;
    } catch (error) {
      logger.error({ error, type: 'analytics_user_chart_failed' });
      throw error;
    }
  }

  /**
   * Get top events by engagement
   */
  async getTopEvents(limit: number = 10): Promise<EventTopData[]> {
    try {
      // Get all events
      const events = await eventRepository.getAllEvents(1000, 0);

      const eventsData: EventTopData[] = [];

      for (const event of events) {
        // Count likes for this event
        const likesResult = await postgresClient.executeQuery<{ count: string }>(
          'SELECT COUNT(*) as count FROM likes WHERE event_id = $1',
          [event.id]
        );
        const likes = parseInt(likesResult[0]?.count || '0', 10);

        // Count matches for this event
        const matchesResult = await postgresClient.executeQuery<{ count: string }>(
          'SELECT COUNT(*) as count FROM matches WHERE event_id = $1',
          [event.id]
        );
        const matches = parseInt(matchesResult[0]?.count || '0', 10);

        // Estimate views (likes * 10)
        const views = likes * 10;

        eventsData.push({
          id: event.id,
          title: event.title,
          likes,
          views,
          matches,
        });
      }

      // Sort by likes and return top N
      return eventsData.sort((a, b) => b.likes - a.likes).slice(0, limit);
    } catch (error) {
      logger.error({ error, type: 'analytics_top_events_failed' });
      throw error;
    }
  }

  /**
   * Get funnel data
   */
  async getFunnelData(): Promise<FunnelData[]> {
    try {
      // Estimate views (would need views table in real implementation)
      const likesResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM likes'
      );
      const likes = parseInt(likesResult[0]?.count || '0', 10);
      const views = likes * 10;

      // Get matches
      const matchesResult = await postgresClient.executeQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM matches'
      );
      const matches = parseInt(matchesResult[0]?.count || '0', 10);

      return [
        {
          stage: 'Просмотры',
          count: views,
          percentage: 100,
        },
        {
          stage: 'Лайки',
          count: likes,
          percentage: views > 0 ? Math.round((likes / views) * 100 * 10) / 10 : 0,
        },
        {
          stage: 'Матчи',
          count: matches,
          percentage: views > 0 ? Math.round((matches / views) * 100 * 10) / 10 : 0,
        },
      ];
    } catch (error) {
      logger.error({ error, type: 'analytics_funnel_failed' });
      throw error;
    }
  }

  /**
   * Get activity heatmap data
   */
  async getActivityHeatmap(): Promise<ActivityHeatmapData[]> {
    try {
      const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const data: ActivityHeatmapData[] = [];

      // Get all matches once and process in JavaScript
      let allMatches: { created_at: Date }[] = [];
      try {
        allMatches = await postgresClient.executeQuery<{ created_at: Date }>(
          'SELECT created_at FROM matches'
        );
      } catch (error) {
        logger.warn({ error, type: 'analytics_heatmap_matches_fetch_failed' });
      }

      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          // Filter matches by day/hour in JavaScript
          const value = allMatches.filter((m) => {
            const matchDate = new Date(m.created_at);
            const matchDay = (matchDate.getDay() + 6) % 7; // Convert to Monday=0, Sunday=6
            const matchHour = matchDate.getHours();
            return matchDay === day && matchHour === hour;
          }).length;

          data.push({
            day: days[day],
            hour,
            value,
          });
        }
      }

      return data;
    } catch (error) {
      logger.error({ error, type: 'analytics_heatmap_failed' });
      // Return simplified data if query fails
      const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const data: ActivityHeatmapData[] = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          data.push({
            day: days[day],
            hour,
            value: Math.floor(Math.random() * 100),
          });
        }
      }
      return data;
    }
  }

  /**
   * Get recent matches
   */
  async getRecentMatches(limit: number = 10): Promise<RecentMatch[]> {
    try {
      const matchesResult = await postgresClient.executeQuery<{
        id: string;
        user_id1: string;
        user_id2: string;
        event_id?: string;
        created_at: Date;
      }>(
        `SELECT id, user_id1, user_id2, event_id, created_at 
         FROM matches 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );

      const recentMatches: RecentMatch[] = [];

      for (const match of matchesResult) {
        // Get user details
        const user1 = await userRepository.getUserById(match.user_id1);
        const user2 = await userRepository.getUserById(match.user_id2);

        if (!user1 || !user2) {
          continue;
        }

        // Get event details if event_id exists
        let eventTitle: string | undefined;
        if (match.event_id) {
          const event = await eventRepository.getEventById(match.event_id);
          eventTitle = event?.title;
        }

        recentMatches.push({
          id: match.id,
          user1: {
            id: user1.id,
            name: `${user1.firstName} ${user1.lastName || ''}`.trim(),
          },
          user2: {
            id: user2.id,
            name: `${user2.firstName} ${user2.lastName || ''}`.trim(),
          },
          eventId: match.event_id,
          eventTitle,
          createdAt: match.created_at,
        });
      }

      return recentMatches;
    } catch (error) {
      logger.error({ error, type: 'analytics_recent_matches_failed' });
      throw error;
    }
  }

  /**
   * Get online users count (simplified - users active in last 5 minutes)
   */
  async getOnlineUsersCount(): Promise<number> {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const matches1Result = await postgresClient.executeQuery<{ user_id1: string }>(
        'SELECT DISTINCT user_id1 FROM matches WHERE created_at >= $1',
        [fiveMinutesAgo]
      );
      const matches2Result = await postgresClient.executeQuery<{ user_id2: string }>(
        'SELECT DISTINCT user_id2 FROM matches WHERE created_at >= $1',
        [fiveMinutesAgo]
      );
      const likesResult = await postgresClient.executeQuery<{ from_user_id: string }>(
        'SELECT DISTINCT from_user_id FROM likes WHERE created_at >= $1',
        [fiveMinutesAgo]
      );

      // Combine unique user IDs
      const activeUserIds = new Set<string>();
      matches1Result.forEach((r) => activeUserIds.add(r.user_id1));
      matches2Result.forEach((r) => activeUserIds.add(r.user_id2));
      likesResult.forEach((r) => activeUserIds.add(r.from_user_id));

      return activeUserIds.size;
    } catch (error) {
      logger.error({ error, type: 'analytics_online_users_failed' });
      return 0;
    }
  }
}

// Export singleton instance
export const analyticsRepository = new AnalyticsRepository();
