import { Router } from 'express';
import { validate } from '../validation/validate';
import {
  analyticsOverviewQuerySchema,
  usersChartQuerySchema,
  eventsTopQuerySchema,
  recentMatchesQuerySchema,
} from '../validation/schemas';

const router = Router();

// Mock данные для демонстрации
// В реальном проекте здесь будут запросы к базе данных

// Общая статистика
router.get('/analytics/overview', validate({ query: analyticsOverviewQuerySchema }), async (req, res) => {
  try {
    // TODO: Заменить на реальные данные из БД
    const data = {
      users: {
        total: 1250,
        newThisWeek: 87,
        growth: 12.5,
      },
      events: {
        active: 45,
        past: 120,
        total: 165,
      },
      matches: {
        total: 342,
        today: 12,
        thisWeek: 89,
        growth: 8.3,
      },
      conversionRate: {
        likesToMatches: 15.2,
        viewsToLikes: 8.5,
        viewsToMatches: 1.3,
      },
      onlineUsers: 156,
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// График регистраций пользователей
router.get('/analytics/users-chart', validate({ query: usersChartQuerySchema }), async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const days = period === '7d' ? 7 : 30;

    // TODO: Заменить на реальные данные из БД
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString(),
        registrations: Math.floor(Math.random() * 20) + 5,
        active: Math.floor(Math.random() * 50) + 20,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Топ событий
router.get('/analytics/events-top', validate({ query: eventsTopQuerySchema }), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // TODO: Заменить на реальные данные из БД
    const data = Array.from({ length: limit }, (_, i) => ({
      id: `event-${i + 1}`,
      title: `Событие ${i + 1}`,
      likes: Math.floor(Math.random() * 500) + 100,
      views: Math.floor(Math.random() * 2000) + 500,
      matches: Math.floor(Math.random() * 50) + 10,
    })).sort((a, b) => b.likes - a.likes);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Воронка конверсии
router.get('/analytics/funnel', async (req, res) => {
  try {
    // TODO: Заменить на реальные данные из БД
    const views = 10000;
    const likes = 850;
    const matches = 130;

    const data = [
      {
        stage: 'Просмотры',
        count: views,
        percentage: 100,
      },
      {
        stage: 'Лайки',
        count: likes,
        percentage: (likes / views) * 100,
      },
      {
        stage: 'Матчи',
        count: matches,
        percentage: (matches / views) * 100,
      },
    ];

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Активность по дням недели (heatmap)
router.get('/analytics/activity-heatmap', async (req, res) => {
  try {
    // TODO: Заменить на реальные данные из БД
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

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Последние матчи
router.get('/analytics/recent-matches', validate({ query: recentMatchesQuerySchema }), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // TODO: Заменить на реальные данные из БД
    const data = Array.from({ length: limit }, (_, i) => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - i * 15);
      return {
        id: `match-${i + 1}`,
        user1: {
          id: `user-${i * 2 + 1}`,
          name: `Пользователь ${i * 2 + 1}`,
        },
        user2: {
          id: `user-${i * 2 + 2}`,
          name: `Пользователь ${i * 2 + 2}`,
        },
        eventId: i % 3 === 0 ? `event-${i}` : undefined,
        eventTitle: i % 3 === 0 ? `Событие ${i}` : undefined,
        createdAt: date.toISOString(),
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;

