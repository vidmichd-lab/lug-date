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
    logger.error({ error, type: 'admin_overview_failed', stack: error instanceof Error ? error.stack : undefined });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorDetails = error instanceof Error && error.stack ? { stack: error.stack } : {};
    res.status(400).json({ 
      success: false, 
      error: { 
        message: errorMessage,
        code: 'ANALYTICS_ERROR',
        ...errorDetails
      } 
    });
  }
});

// График регистраций пользователей
router.get('/analytics/users-chart', validate({ query: usersChartQuerySchema }), async (req, res) => {
  try {
    const query = req.query as { period?: '7d' | '30d' };
    const { period = '7d' } = query;
    const days = period === '7d' ? 7 : 30;

    const data = await analyticsRepository.getUserChartData(days);

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_users_chart_failed', stack: error instanceof Error ? error.stack : undefined });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ 
      success: false, 
      error: { 
        message: errorMessage,
        code: 'ANALYTICS_ERROR'
      } 
    });
  }
});

// Топ событий
router.get('/analytics/events-top', validate({ query: eventsTopQuerySchema }), async (req, res) => {
  try {
    const { limit = 10 } = req.query as { limit?: number };
    const limitNumber = typeof limit === 'number' ? limit : parseInt(String(limit || 10), 10);

    const data = await analyticsRepository.getTopEvents(limitNumber);

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_events_top_failed', stack: error instanceof Error ? error.stack : undefined });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ 
      success: false, 
      error: { 
        message: errorMessage,
        code: 'ANALYTICS_ERROR'
      } 
    });
  }
});

// Воронка конверсии
router.get('/analytics/funnel', async (req, res) => {
  try {
    const data = await analyticsRepository.getFunnelData();

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_funnel_failed', stack: error instanceof Error ? error.stack : undefined });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ 
      success: false, 
      error: { 
        message: errorMessage,
        code: 'ANALYTICS_ERROR'
      } 
    });
  }
});

// Активность по дням недели (heatmap)
router.get('/analytics/activity-heatmap', async (req, res) => {
  try {
    const data = await analyticsRepository.getActivityHeatmap();

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_heatmap_failed', stack: error instanceof Error ? error.stack : undefined });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ 
      success: false, 
      error: { 
        message: errorMessage,
        code: 'ANALYTICS_ERROR'
      } 
    });
  }
});

// Последние матчи
router.get('/analytics/recent-matches', validate({ query: recentMatchesQuerySchema }), async (req, res) => {
  try {
    const query = req.query as { limit?: number };
    const { limit = 10 } = query;
    const limitNumber = typeof limit === 'number' ? limit : parseInt(String(limit || 10), 10);

    const data = await analyticsRepository.getRecentMatches(limitNumber);

    res.json({ success: true, data });
  } catch (error) {
    logger.error({ error, type: 'admin_recent_matches_failed', stack: error instanceof Error ? error.stack : undefined });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ 
      success: false, 
      error: { 
        message: errorMessage,
        code: 'ANALYTICS_ERROR'
      } 
    });
  }
});

export default router;

