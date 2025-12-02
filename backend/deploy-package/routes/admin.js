"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("../validation/validate");
const schemas_1 = require("../validation/schemas");
const analyticsRepository_1 = require("../repositories/analyticsRepository");
const logger_1 = require("../logger");
const router = (0, express_1.Router)();
// Общая статистика
router.get('/analytics/overview', (0, validate_1.validate)({ query: schemas_1.analyticsOverviewQuerySchema }), async (req, res) => {
    try {
        const [users, events, matches, conversionRate, onlineUsers] = await Promise.all([
            analyticsRepository_1.analyticsRepository.getUserStats(),
            analyticsRepository_1.analyticsRepository.getEventStats(),
            analyticsRepository_1.analyticsRepository.getMatchStats(),
            analyticsRepository_1.analyticsRepository.getConversionRates(),
            analyticsRepository_1.analyticsRepository.getOnlineUsersCount(),
        ]);
        const data = {
            users,
            events,
            matches,
            conversionRate,
            onlineUsers,
        };
        res.json({ success: true, data });
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'admin_overview_failed', stack: error instanceof Error ? error.stack : undefined });
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
router.get('/analytics/users-chart', (0, validate_1.validate)({ query: schemas_1.usersChartQuerySchema }), async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        const days = period === '7d' ? 7 : 30;
        const data = await analyticsRepository_1.analyticsRepository.getUserChartData(days);
        res.json({ success: true, data });
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'admin_users_chart_failed', stack: error instanceof Error ? error.stack : undefined });
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
router.get('/analytics/events-top', (0, validate_1.validate)({ query: schemas_1.eventsTopQuerySchema }), async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const limitNumber = typeof limit === 'number' ? limit : parseInt(String(limit || 10), 10);
        const data = await analyticsRepository_1.analyticsRepository.getTopEvents(limitNumber);
        res.json({ success: true, data });
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'admin_events_top_failed', stack: error instanceof Error ? error.stack : undefined });
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
        const data = await analyticsRepository_1.analyticsRepository.getFunnelData();
        res.json({ success: true, data });
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'admin_funnel_failed', stack: error instanceof Error ? error.stack : undefined });
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
        const data = await analyticsRepository_1.analyticsRepository.getActivityHeatmap();
        res.json({ success: true, data });
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'admin_heatmap_failed', stack: error instanceof Error ? error.stack : undefined });
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
router.get('/analytics/recent-matches', (0, validate_1.validate)({ query: schemas_1.recentMatchesQuerySchema }), async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const limitNumber = typeof limit === 'number' ? limit : parseInt(String(limit || 10), 10);
        const data = await analyticsRepository_1.analyticsRepository.getRecentMatches(limitNumber);
        res.json({ success: true, data });
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'admin_recent_matches_failed', stack: error instanceof Error ? error.stack : undefined });
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
exports.default = router;
