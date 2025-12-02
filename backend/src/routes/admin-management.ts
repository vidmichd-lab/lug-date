/**
 * Admin Management Routes
 * CRUD operations for users, events, categories, and settings
 */

import { Router, Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository';
import { eventRepository } from '../repositories/eventRepository';
import { logger } from '../logger';
import { z } from 'zod';
import type { Event, User } from '@dating-app/shared';
import { faker } from '@faker-js/faker';
import multer from 'multer';
import sharp from 'sharp';
import { objectStorageService } from '../services/objectStorage';

const router = Router();

// Add logging middleware for all routes in this router
router.use((req, res, next) => {
  logger.info({
    type: 'admin_management_route',
    method: req.method,
    path: req.path,
    query: req.query,
    url: req.url,
  });
  next();
});

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req: Request, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Extend Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

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
    logger.error({ error, type: 'admin_get_users_failed', stack: error instanceof Error ? error.stack : undefined });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_get_user_failed', userId: req.params.id, stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
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
    // Type assertion needed because updateUser accepts Partial<User> which includes isBanned
    const updatedUser = await userRepository.updateUser(id, updates as Partial<User>);
    
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_update_user_failed', userId: req.params.id, stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// Delete user (soft delete - mark as banned)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement soft delete - isBanned field needs to be added to DB schema
    // For now, we'll just return success as the field is not yet in the schema
    // await userRepository.updateUser(id, { isBanned: true } as Partial<User>);
    
    res.json({ success: true, message: 'User banned (feature not yet implemented in DB)' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_delete_user_failed', userId: req.params.id, stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// ============================================
// Events Management
// ============================================

const eventCreateSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  category: z.string().min(1, 'Категория обязательна'),
  imageUrl: z.union([z.string().url(), z.string().length(0), z.undefined()]).optional(),
  location: z.string().optional(),
  date: z.string().optional(),
});

const eventUpdateSchema = eventCreateSchema.partial();

// Get all events
router.get('/events', async (req, res) => {
  try {
    logger.info({
      type: 'admin_get_events_request',
      query: req.query,
      headers: req.headers,
    });

    // Parse query parameters with validation
    let limit = 50;
    let offset = 0;
    
    if (req.query.limit) {
      const limitNum = parseInt(String(req.query.limit), 10);
      if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 1000) {
        limit = limitNum;
      }
    }
    
    if (req.query.offset) {
      const offsetNum = parseInt(String(req.query.offset), 10);
      if (!isNaN(offsetNum) && offsetNum >= 0) {
        offset = offsetNum;
      }
    }

    logger.info({
      type: 'admin_get_events_params',
      limit,
      offset,
    });

    const events = await eventRepository.getAllEvents(limit, offset);
    const total = await eventRepository.getEventsCount();

    logger.info({
      type: 'admin_get_events_success',
      eventsCount: events.length,
      total,
    });

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
    logger.error({ 
      error, 
      type: 'admin_get_events_failed',
      query: req.query,
      stack: error instanceof Error ? error.stack : undefined,
    });
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(400).json({ 
      success: false, 
      error: { 
        message: errorMessage,
        code: 'DATABASE_ERROR'
      } 
    });
  }
});

// Create event
router.post('/events', async (req, res) => {
  try {
    const validation = eventCreateSchema.safeParse(req.body);
    
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: `Validation failed: ${errorMessages}`,
          details: validation.error.issues 
        } 
      });
    }
    
    const now = new Date();
    let eventDate: Date | undefined;
    if (validation.data.date && validation.data.date.trim()) {
      // Parse date string (YYYY-MM-DD format) and set to end of day (23:59:59)
      const dateStr = validation.data.date.trim();
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ 
          success: false, 
          error: { message: 'Invalid date format' } 
        });
      }
      // Set to end of day (23:59:59.999) so event shows until end of that date
      eventDate = new Date(parsedDate);
      eventDate.setHours(23, 59, 59, 999);
    }
    
    // Clean up empty strings for optional fields
    const imageUrl = validation.data.imageUrl?.trim() || undefined;
    const location = validation.data.location?.trim() || undefined;
    
    const event: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: validation.data.title.trim(),
      description: validation.data.description.trim(),
      category: validation.data.category.trim(),
      imageUrl: imageUrl && imageUrl.length > 0 ? imageUrl : undefined,
      location: location && location.length > 0 ? location : undefined,
      date: eventDate,
      createdAt: now,
      updatedAt: now,
    };

    const createdEvent = await eventRepository.createEvent(event);
    
    res.json({ success: true, data: createdEvent });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_create_event_failed', stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// Update event
router.patch('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validation = eventUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: `Validation failed: ${errorMessages}`,
          details: validation.error.issues 
        } 
      });
    }
    
    const updates: Partial<Event> = {};
    if (validation.data.title !== undefined) {
      updates.title = validation.data.title.trim();
    }
    if (validation.data.description !== undefined) {
      updates.description = validation.data.description.trim();
    }
    if (validation.data.category !== undefined) {
      updates.category = validation.data.category.trim();
    }
    if (validation.data.imageUrl !== undefined) {
      const imageUrl = validation.data.imageUrl.trim();
      updates.imageUrl = imageUrl && imageUrl.length > 0 ? imageUrl : undefined;
    }
    if (validation.data.location !== undefined) {
      const location = validation.data.location.trim();
      updates.location = location && location.length > 0 ? location : undefined;
    }
    if (validation.data.date !== undefined && validation.data.date.trim()) {
      // Parse date string (YYYY-MM-DD format) and set to end of day (23:59:59)
      const dateStr = validation.data.date.trim();
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ 
          success: false, 
          error: { message: 'Invalid date format' } 
        });
      }
      // Set to end of day (23:59:59.999) so event shows until end of that date
      const eventDate = new Date(parsedDate);
      eventDate.setHours(23, 59, 59, 999);
      updates.date = eventDate;
    }

    const updatedEvent = await eventRepository.updateEvent(id, updates);
    
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_update_event_failed', eventId: req.params.id, stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await eventRepository.deleteEvent(id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_delete_event_failed', eventId: req.params.id, stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_get_categories_failed', stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_update_categories_failed', stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_get_settings_failed', stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// Update settings
router.put('/settings', async (req, res) => {
  try {
    // TODO: Save settings to DB or config
    res.json({ success: true, data: req.body });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_update_settings_failed', stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// ============================================
// Seed Data (for testing)
// ============================================

// Generate fake photo URL
function generatePhotoUrl(gender: 'male' | 'female'): string {
  const genderParam = gender === 'male' ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${genderParam}/${faker.number.int({ min: 1, max: 99 })}.jpg`;
}

// Create test users
router.post('/seed/users', async (req, res) => {
  try {
    const count = parseInt(req.body.count || '10', 10);
    const eventCategories = ['art', 'music', 'theater', 'cinema', 'sport', 'food'];
    
    const createdUsers = [];
    
    for (let i = 0; i < count; i++) {
      const gender = faker.helpers.arrayElement(['male', 'female'] as const);
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      const now = new Date();
      
      const user: User = {
        id: `user-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        telegramId: faker.number.int({ min: 100000000, max: 999999999 }),
        username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
        firstName,
        lastName,
        photoUrl: generatePhotoUrl(gender),
        bio: faker.person.bio(),
        age: faker.number.int({ min: 18, max: 65 }),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: now,
      };
      
      await userRepository.upsertUser(user);
      createdUsers.push(user);
    }
    
    logger.info({ type: 'admin_seed_users', count: createdUsers.length });
    res.json({ success: true, data: createdUsers, count: createdUsers.length });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_seed_users_failed', stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// Create test events
router.post('/seed/events', async (req, res) => {
  try {
    const count = parseInt(req.body.count || '10', 10);
    const eventCategories = ['art', 'music', 'theater', 'cinema', 'sport', 'food'];
    
    const createdEvents = [];
    
    for (let i = 0; i < count; i++) {
      const category = faker.helpers.arrayElement(eventCategories);
      const now = new Date();
      
      const event: Event = {
        id: `event-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        description: faker.lorem.paragraph({ min: 2, max: 4 }),
        category,
        imageUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(10)}/800/600`,
        location: faker.location.city(),
        date: faker.date.future({ years: 1 }),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: now,
      };
      
      await eventRepository.createEvent(event);
      createdEvents.push(event);
    }
    
    logger.info({ type: 'admin_seed_events', count: createdEvents.length });
    res.json({ success: true, data: createdEvents, count: createdEvents.length });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error, type: 'admin_seed_events_failed', stack: error instanceof Error ? error.stack : undefined });
    res.status(400).json({ 
      success: false, 
      error: {
        message: errorMessage,
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// ============================================
// Image Upload for Events
// ============================================

// Upload event image
router.post('/events/upload-image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      logger.error({ error: err, type: 'multer_upload_error' });
      return res.status(400).json({
        success: false,
        error: { 
          message: err.message || 'File upload error',
          code: err.code || 'UPLOAD_ERROR'
        },
      });
    }
    next();
  });
}, async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      logger.warn({ type: 'no_file_uploaded', body: req.body, files: (req as any).files });
      return res.status(400).json({
        success: false,
        error: { message: 'Image file is required. Please select a file to upload.' },
      });
    }

    logger.info({
      type: 'file_upload_received',
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Optimize image (resize to max 1200px width, maintain aspect ratio)
    let optimizedBuffer: Buffer;
    try {
      const sharpInstance = sharp(req.file.buffer);
      
      // Get image metadata
      const metadata = await sharpInstance.metadata();
      logger.info({
        type: 'image_metadata',
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
      });
      
      // Resize and convert to JPEG
      optimizedBuffer = await sharpInstance
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } catch (sharpError) {
      logger.error({ 
        error: sharpError, 
        type: 'sharp_processing_error',
        mimetype: req.file.mimetype,
      });
      throw new Error('Не удалось обработать изображение. Убедитесь, что файл является валидным изображением.');
    }

    // Generate unique key for event image
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const imageKey = `events/${timestamp}-${randomId}.jpg`;

    let imageUrl: string;

    if (objectStorageService.isInitialized()) {
      // Upload to Object Storage
      imageUrl = await objectStorageService.uploadFile(
        imageKey,
        optimizedBuffer,
        'image/jpeg',
        { type: 'event_image' }
      );
    } else {
      // Fallback: return base64 if Object Storage not configured
      logger.warn({
        type: 'object_storage_not_available',
        message: 'Object Storage not configured, returning base64',
      });
      imageUrl = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
    }

    logger.info({
      type: 'admin_event_image_uploaded',
      imageKey,
      size: optimizedBuffer.length,
    });

    res.json({
      success: true,
      data: { imageUrl },
    });
  } catch (error) {
    logger.error({ 
      error, 
      type: 'admin_event_image_upload_failed',
      filename: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
    });
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for specific error types
      if (error.message.includes('sharp') || error.message.includes('image')) {
        statusCode = 400;
        errorMessage = 'Invalid image file. Please upload a valid image (JPEG, PNG, etc.)';
      }
    }
    
    res.status(statusCode).json({
      success: false,
      error: { message: errorMessage },
    });
  }
});

export default router;

