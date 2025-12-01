/**
 * Admin Management Routes
 * CRUD operations for users, events, categories, and settings
 */

import { Router } from 'express';
import { userRepository } from '../repositories/userRepository';
import { eventRepository } from '../repositories/eventRepository';
import { logger } from '../logger';
import { z } from 'zod';
import type { Event } from '@dating-app/shared';

const router = Router();

// ============================================
// Users Management
// ============================================

const userUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  age: z.number().optional(),
  photoUrl: z.string().optional(),
  isBanned: z.boolean().optional(),
  isModerated: z.boolean().optional(),
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const users = await userRepository.getAllUsers(limit, offset);
    const total = await userRepository.getUsersCount();

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    logger.error({ error, type: 'admin_get_users_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error({ error, type: 'admin_get_user_failed', userId: req.params.id });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update user
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validation = userUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    
    const updates = validation.data;
    const updatedUser = await userRepository.updateUser(id, updates);
    
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    logger.error({ error, type: 'admin_update_user_failed', userId: req.params.id });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete user (soft delete - mark as banned)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement soft delete
    await userRepository.updateUser(id, { isBanned: true });
    
    res.json({ success: true, message: 'User banned' });
  } catch (error) {
    logger.error({ error, type: 'admin_delete_user_failed', userId: req.params.id });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================
// Events Management
// ============================================

const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
});

const eventUpdateSchema = eventCreateSchema.partial();

// Get all events
router.get('/events', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const events = await eventRepository.getAllEvents(limit, offset);
    const total = await eventRepository.getEventsCount();

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    logger.error({ error, type: 'admin_get_events_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create event
router.post('/events', async (req, res) => {
  try {
    const validation = eventCreateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    
    const now = new Date();
    const event: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: validation.data.title,
      description: validation.data.description,
      category: validation.data.category,
      imageUrl: validation.data.imageUrl,
      location: validation.data.location,
      date: validation.data.date ? new Date(validation.data.date) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const createdEvent = await eventRepository.createEvent(event);
    
    res.json({ success: true, data: createdEvent });
  } catch (error) {
    logger.error({ error, type: 'admin_create_event_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update event
router.patch('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validation = eventUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    
    const updates: Partial<Event> = {};
    if (validation.data.title !== undefined) updates.title = validation.data.title;
    if (validation.data.description !== undefined) updates.description = validation.data.description;
    if (validation.data.category !== undefined) updates.category = validation.data.category;
    if (validation.data.imageUrl !== undefined) updates.imageUrl = validation.data.imageUrl;
    if (validation.data.location !== undefined) updates.location = validation.data.location;
    if (validation.data.date !== undefined) updates.date = new Date(validation.data.date);

    const updatedEvent = await eventRepository.updateEvent(id, updates);
    
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    logger.error({ error, type: 'admin_update_event_failed', eventId: req.params.id });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await eventRepository.deleteEvent(id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    logger.error({ error, type: 'admin_delete_event_failed', eventId: req.params.id });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================
// Categories Management
// ============================================

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    // TODO: Implement categories storage (could be in DB or config file)
    const defaultCategories = [
      { id: 'all', name: 'all', label: 'Все', order: 0, isActive: true },
      { id: 'art', name: 'art', label: 'Искусство', order: 1, isActive: true },
      { id: 'music', name: 'music', label: 'Музыка', order: 2, isActive: true },
      { id: 'theater', name: 'theater', label: 'Театр', order: 3, isActive: true },
      { id: 'cinema', name: 'cinema', label: 'Кино', order: 4, isActive: true },
      { id: 'sport', name: 'sport', label: 'Спорт', order: 5, isActive: true },
      { id: 'food', name: 'food', label: 'Еда', order: 6, isActive: true },
    ];
    
    res.json({ success: true, data: defaultCategories });
  } catch (error) {
    logger.error({ error, type: 'admin_get_categories_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update categories
router.put('/categories', async (req, res) => {
  try {
    const validation = z.array(categorySchema).safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    
    // TODO: Save categories to DB or config
    res.json({ success: true, data: validation.data });
  } catch (error) {
    logger.error({ error, type: 'admin_update_categories_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================
// Settings Management
// ============================================

// Get settings
router.get('/settings', async (req, res) => {
  try {
    // TODO: Implement settings storage
    const defaultSettings = {
      appName: 'Dating App',
      minAge: 18,
      maxAge: 100,
      cities: ['Москва', 'Санкт-Петербург'],
      goals: [
        { id: 'find-friends', label: 'Найти друзей' },
        { id: 'networking', label: 'Нетворкинг' },
        { id: 'dating', label: 'Познакомиться' },
        { id: 'serious-relationship', label: 'Серьезные отношения' },
        { id: 'other', label: 'Другой' },
      ],
    };
    
    res.json({ success: true, data: defaultSettings });
  } catch (error) {
    logger.error({ error, type: 'admin_get_settings_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update settings
router.put('/settings', async (req, res) => {
  try {
    // TODO: Save settings to DB or config
    res.json({ success: true, data: req.body });
  } catch (error) {
    logger.error({ error, type: 'admin_update_settings_failed' });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;

