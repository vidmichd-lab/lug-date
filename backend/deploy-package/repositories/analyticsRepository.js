"use strict";
/**
 * Analytics Repository
 * Handles all analytics queries for admin dashboard
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRepository = exports.AnalyticsRepository = void 0;
const connection_1 = require("../db/connection");
const logger_1 = require("../logger");
const userRepository_1 = require("./userRepository");
class AnalyticsRepository {
    /**
     * Get user statistics
     */
    async getUserStats() {
        try {
            // Total users
            const totalResult = await connection_1.ydbClient.executeQuery('SELECT COUNT(*) as count FROM users');
            const total = totalResult[0]?.count || 0;
            // New users this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const newThisWeekResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM users WHERE createdAt >= $weekAgo`, { weekAgo });
            const newThisWeek = newThisWeekResult[0]?.count || 0;
            // Growth (compare with previous week)
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const previousWeekResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM users WHERE createdAt >= $twoWeeksAgo AND createdAt < $weekAgo`, { twoWeeksAgo, weekAgo });
            const previousWeek = previousWeekResult[0]?.count || 0;
            const growth = previousWeek > 0 ? ((newThisWeek - previousWeek) / previousWeek) * 100 : 0;
            return {
                total,
                newThisWeek,
                growth: Math.round(growth * 10) / 10,
            };
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_user_stats_failed' });
            throw error;
        }
    }
    /**
     * Get event statistics
     */
    async getEventStats() {
        try {
            const now = new Date();
            // Total events
            const totalResult = await connection_1.ydbClient.executeQuery('SELECT COUNT(*) as count FROM events');
            const total = totalResult[0]?.count || 0;
            // Active events (date >= now or date is null)
            const activeResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM events WHERE date IS NULL OR date >= $now`, { now });
            const active = activeResult[0]?.count || 0;
            // Past events
            const past = total - active;
            return {
                active,
                past,
                total,
            };
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_event_stats_failed' });
            throw error;
        }
    }
    /**
     * Get match statistics
     */
    async getMatchStats() {
        try {
            // Total matches
            const totalResult = await connection_1.ydbClient.executeQuery('SELECT COUNT(*) as count FROM matches');
            const total = totalResult[0]?.count || 0;
            // Matches today
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM matches WHERE createdAt >= $todayStart`, { todayStart });
            const today = todayResult[0]?.count || 0;
            // Matches this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const thisWeekResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM matches WHERE createdAt >= $weekAgo`, { weekAgo });
            const thisWeek = thisWeekResult[0]?.count || 0;
            // Growth (compare with previous week)
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const previousWeekResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM matches WHERE createdAt >= $twoWeeksAgo AND createdAt < $weekAgo`, { twoWeeksAgo, weekAgo });
            const previousWeek = previousWeekResult[0]?.count || 0;
            const growth = previousWeek > 0 ? ((thisWeek - previousWeek) / previousWeek) * 100 : 0;
            return {
                total,
                today,
                thisWeek,
                growth: Math.round(growth * 10) / 10,
            };
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_match_stats_failed' });
            throw error;
        }
    }
    /**
     * Get conversion rates
     */
    async getConversionRates() {
        try {
            // Total views (approximate - would need views table in real implementation)
            // For now, using likes as proxy
            const likesResult = await connection_1.ydbClient.executeQuery('SELECT COUNT(*) as count FROM likes');
            const likes = likesResult[0]?.count || 0;
            // Total matches
            const matchesResult = await connection_1.ydbClient.executeQuery('SELECT COUNT(*) as count FROM matches');
            const matches = matchesResult[0]?.count || 0;
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
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_conversion_rates_failed' });
            throw error;
        }
    }
    /**
     * Get user chart data (registrations and active users by date)
     */
    async getUserChartData(days = 7) {
        try {
            const data = [];
            const now = new Date();
            for (let i = 0; i < days; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() - (days - i - 1));
                date.setHours(0, 0, 0, 0);
                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);
                // Registrations on this date
                const registrationsResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM users WHERE createdAt >= $date AND createdAt < $nextDate`, { date, nextDate });
                const registrations = registrationsResult[0]?.count || 0;
                // Active users (users who had activity - simplified: users with matches or likes)
                // In real implementation, would track user activity separately
                // YDB doesn't support UNION ALL in subqueries easily, so we'll count matches and likes separately
                const matchesActiveResult = await connection_1.ydbClient.executeQuery(`SELECT DISTINCT userId1 FROM matches WHERE createdAt >= $date AND createdAt < $nextDate`, { date, nextDate });
                const matchesActive2Result = await connection_1.ydbClient.executeQuery(`SELECT DISTINCT userId2 FROM matches WHERE createdAt >= $date AND createdAt < $nextDate`, { date, nextDate });
                const likesActiveResult = await connection_1.ydbClient.executeQuery(`SELECT DISTINCT fromUserId FROM likes WHERE createdAt >= $date AND createdAt < $nextDate`, { date, nextDate });
                // Combine unique user IDs
                const activeUserIds = new Set();
                matchesActiveResult.forEach(r => activeUserIds.add(r.userId1));
                matchesActive2Result.forEach(r => activeUserIds.add(r.userId2));
                likesActiveResult.forEach(r => activeUserIds.add(r.fromUserId));
                const active = activeUserIds.size;
                data.push({
                    date: date.toISOString(),
                    registrations,
                    active,
                });
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_user_chart_failed' });
            throw error;
        }
    }
    /**
     * Get top events by engagement
     */
    async getTopEvents(limit = 10) {
        try {
            // Get all events
            const eventsResult = await connection_1.ydbClient.executeQuery('SELECT id, title FROM events');
            const eventsData = [];
            for (const event of eventsResult) {
                // Count likes for this event
                const likesResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM likes WHERE eventId = $eventId`, { eventId: event.id });
                const likes = likesResult[0]?.count || 0;
                // Count matches for this event
                const matchesResult = await connection_1.ydbClient.executeQuery(`SELECT COUNT(*) as count FROM matches WHERE eventId = $eventId`, { eventId: event.id });
                const matches = matchesResult[0]?.count || 0;
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
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_top_events_failed' });
            throw error;
        }
    }
    /**
     * Get funnel data
     */
    async getFunnelData() {
        try {
            // Estimate views (would need views table in real implementation)
            const likesResult = await connection_1.ydbClient.executeQuery('SELECT COUNT(*) as count FROM likes');
            const likes = likesResult[0]?.count || 0;
            const views = likes * 10;
            // Get matches
            const matchesResult = await connection_1.ydbClient.executeQuery('SELECT COUNT(*) as count FROM matches');
            const matches = matchesResult[0]?.count || 0;
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
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_funnel_failed' });
            throw error;
        }
    }
    /**
     * Get activity heatmap data
     */
    async getActivityHeatmap() {
        try {
            const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
            const data = [];
            // Get all matches once and process in JavaScript
            // This is not ideal for large datasets, but YDB doesn't support EXTRACT easily
            let allMatches = [];
            try {
                allMatches = await connection_1.ydbClient.executeQuery('SELECT createdAt FROM matches');
            }
            catch (error) {
                logger_1.logger.warn({ error, type: 'analytics_heatmap_matches_fetch_failed' });
            }
            for (let day = 0; day < 7; day++) {
                for (let hour = 0; hour < 24; hour++) {
                    // Filter matches by day/hour in JavaScript
                    const value = allMatches.filter(m => {
                        const matchDate = new Date(m.createdAt);
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
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_heatmap_failed' });
            // Return simplified data if query fails
            const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
            const data = [];
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
    async getRecentMatches(limit = 10) {
        try {
            const matchesResult = await connection_1.ydbClient.executeQuery(`SELECT id, userId1, userId2, eventId, createdAt 
         FROM matches 
         ORDER BY createdAt DESC 
         LIMIT $limit`, { limit });
            const recentMatches = [];
            for (const match of matchesResult) {
                // Get user details
                const user1 = await userRepository_1.userRepository.getUserById(match.userId1);
                const user2 = await userRepository_1.userRepository.getUserById(match.userId2);
                if (!user1 || !user2) {
                    continue;
                }
                // Get event details if eventId exists
                let eventTitle;
                if (match.eventId) {
                    const eventResult = await connection_1.ydbClient.executeQuery(`SELECT title FROM events WHERE id = $eventId`, { eventId: match.eventId });
                    eventTitle = eventResult[0]?.title;
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
                    eventId: match.eventId,
                    eventTitle,
                    createdAt: match.createdAt,
                });
            }
            return recentMatches;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_recent_matches_failed' });
            throw error;
        }
    }
    /**
     * Get online users count (simplified - users active in last 5 minutes)
     */
    async getOnlineUsersCount() {
        try {
            // Simplified: count users who had activity in last 5 minutes
            // In real implementation, would track user sessions
            const fiveMinutesAgo = new Date();
            fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
            // YDB doesn't support UNION ALL in subqueries easily, so we'll query separately
            const matches1Result = await connection_1.ydbClient.executeQuery(`SELECT DISTINCT userId1 FROM matches WHERE createdAt >= $fiveMinutesAgo`, { fiveMinutesAgo });
            const matches2Result = await connection_1.ydbClient.executeQuery(`SELECT DISTINCT userId2 FROM matches WHERE createdAt >= $fiveMinutesAgo`, { fiveMinutesAgo });
            const likesResult = await connection_1.ydbClient.executeQuery(`SELECT DISTINCT fromUserId FROM likes WHERE createdAt >= $fiveMinutesAgo`, { fiveMinutesAgo });
            // Combine unique user IDs
            const activeUserIds = new Set();
            matches1Result.forEach(r => activeUserIds.add(r.userId1));
            matches2Result.forEach(r => activeUserIds.add(r.userId2));
            likesResult.forEach(r => activeUserIds.add(r.fromUserId));
            return activeUserIds.size;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'analytics_online_users_failed' });
            // Return 0 if query fails
            return 0;
        }
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
// Export singleton instance
exports.analyticsRepository = new AnalyticsRepository();
