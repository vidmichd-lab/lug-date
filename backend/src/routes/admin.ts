import { Router } from 'express';
import { validate } from '../validation/validate';
import {
  analyticsOverviewQuerySchema,
  usersChartQuerySchema,
  eventsTopQuerySchema,
  recentMatchesQuerySchema,
} from '../validation/schemas';
import { analyticsRepository } from '../repositories/analyticsRepository';
import { logger } from '../logger';

const router = Router();

// Общая статистика
router.get('/analytics/overview', validate({ query: analyticsOverviewQuerySchema }), async (req, res) => {
  try {
    const [users, events, matches, conversionRate, onlineUsers] = await Promise.all([
      analyticsRepository.getUserStats(),
      analyticsRepository.getEventStats(),
      analyticsRepository.getMatchStats(),
      analyticsRepository.getConversionRates(),
      analyticsRepository.getOnlineUsersCount(),
    ]);

    const data = {
      users,
      events,
      matches,
      conversionRate,
      onlineUsers,
    };

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_overview_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// График регистраций пользователей
router.get('/analytics/users-chart', validate({ query: usersChartQuerySchema }), async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const days = period === '7d' ? 7 : 30;

    const data = await analyticsRepository.getUserChartData(days);

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_users_chart_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Топ событий
router.get('/analytics/events-top', validate({ query: eventsTopQuerySchema }), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNumber = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    const data = await analyticsRepository.getTopEvents(limitNumber);

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_events_top_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Воронка конверсии
router.get('/analytics/funnel', async (req, res) => {
  try {
    const data = await analyticsRepository.getFunnelData();

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_funnel_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Активность по дням недели (heatmap)
router.get('/analytics/activity-heatmap', async (req, res) => {
  try {
    const data = await analyticsRepository.getActivityHeatmap();

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_heatmap_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Последние матчи
router.get('/analytics/recent-matches', validate({ query: recentMatchesQuerySchema }), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNumber = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    const data = await analyticsRepository.getRecentMatches(limitNumber);

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_recent_matches_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;

