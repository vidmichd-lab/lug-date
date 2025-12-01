/**
 * Event Repository
 * Handles all database operations for events
 */

import { ydbClient } from '../db/connection';
import { logger } from '../logger';
import type { Event } from '@dating-app/shared';

export class EventRepository {
  /**
   * Create event
   */
  async createEvent(event: Event): Promise<Event> {
    try {
      const query = `
        INSERT INTO events (id, title, description, category, imageUrl, location, date, createdAt, updatedAt)
        VALUES ($id, $title, $description, $category, $imageUrl, $location, $date, $createdAt, $updatedAt);
      `;

      const params = {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        imageUrl: event.imageUrl || null,
        location: event.location || null,
        date: event.date || null,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };

      await ydbClient.executeQuery(query, params);
      logger.info({ type: 'event_created', eventId: event.id });

      return event;
    } catch (error) {
      logger.error({ error, type: 'event_create_failed', eventId: event.id });
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const query = `
        SELECT * FROM events WHERE id = $id;
      `;

      const results = await ydbClient.executeQuery<Event>(query, { id: eventId });

      return results[0] || null;
    } catch (error) {
      logger.error({ error, type: 'event_get_failed', eventId });
      throw error;
    }
  }

  /**
   * Get events by category
   */
  async getEventsByCategory(
    category: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Event[]> {
    try {
      const query = `
        SELECT * FROM events 
        WHERE category = $category
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;

      const results = await ydbClient.executeQuery<Event>(query, {
        category,
        limit,
        offset,
      });

      return results;
    } catch (error) {
      logger.error({ error, type: 'events_get_by_category_failed', category });
      throw error;
    }
  }

  /**
   * Get all events with pagination
   */
  async getEvents(limit: number = 20, offset: number = 0): Promise<Event[]> {
    try {
      const query = `
        SELECT * FROM events 
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;

      const results = await ydbClient.executeQuery<Event>(query, {
        limit,
        offset,
      });

      return results;
    } catch (error) {
      logger.error({ error, type: 'events_get_failed' });
      throw error;
    }
  }

  /**
   * Get all events with pagination (for admin)
   */
  async getAllEvents(limit: number = 50, offset: number = 0): Promise<Event[]> {
    try {
      const query = `
        SELECT * FROM events 
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;

      const results = await ydbClient.executeQuery<Event>(query, {
        limit,
        offset,
      });

      return results;
    } catch (error) {
      logger.error({ error, type: 'events_get_all_failed' });
      throw error;
    }
  }

  /**
   * Get total events count
   */
  async getEventsCount(): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM events;
      `;

      const results = await ydbClient.executeQuery<{ count: number }>(query);

      return results[0]?.count || 0;
    } catch (error) {
      logger.error({ error, type: 'events_count_failed' });
      throw error;
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    try {
      const setClause: string[] = [];
      const params: Record<string, any> = { id: eventId };

      if (updates.title !== undefined) {
        setClause.push('title = $title');
        params.title = updates.title;
      }
      if (updates.description !== undefined) {
        setClause.push('description = $description');
        params.description = updates.description;
      }
      if (updates.category !== undefined) {
        setClause.push('category = $category');
        params.category = updates.category;
      }
      if (updates.imageUrl !== undefined) {
        setClause.push('imageUrl = $imageUrl');
        params.imageUrl = updates.imageUrl;
      }
      if (updates.location !== undefined) {
        setClause.push('location = $location');
        params.location = updates.location;
      }
      if (updates.date !== undefined) {
        setClause.push('date = $date');
        params.date = updates.date;
      }

      setClause.push('updatedAt = $updatedAt');
      params.updatedAt = new Date();

      if (setClause.length === 1) {
        // Only updatedAt, no need to update
        return await this.getEventById(eventId) || ({} as Event);
      }

      const query = `
        UPDATE events SET ${setClause.join(', ')} WHERE id = $id;
      `;

      await ydbClient.executeQuery(query, params);

      // Fetch updated event
      const updatedEvent = await this.getEventById(eventId);
      if (!updatedEvent) {
        throw new Error('Event not found after update');
      }

      logger.info({ type: 'event_updated', eventId });
      return updatedEvent;
    } catch (error) {
      logger.error({ error, type: 'event_update_failed', eventId });
      throw error;
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM events WHERE id = $id;
      `;

      await ydbClient.executeQuery(query, { id: eventId });

      logger.info({ type: 'event_deleted', eventId });
      return true;
    } catch (error) {
      logger.error({ error, type: 'event_delete_failed', eventId });
      throw error;
    }
  }

  /**
   * Get events by IDs
   */
  async getEventsByIds(eventIds: string[]): Promise<Event[]> {
    try {
      if (eventIds.length === 0) {
        return [];
      }

      // YDB supports IN with parameterized values
      // Build query with OR conditions for better compatibility
      if (eventIds.length === 1) {
        const query = `SELECT * FROM events WHERE id = $id0;`;
        const results = await ydbClient.executeQuery<Event>(query, { id0: eventIds[0] });
        return results;
      }

      // For multiple IDs, use OR conditions
      const conditions = eventIds.map((_, index) => `id = $id${index}`).join(' OR ');
      const query = `SELECT * FROM events WHERE ${conditions};`;

      const params: Record<string, string> = {};
      eventIds.forEach((id, index) => {
        params[`id${index}`] = id;
      });

      const results = await ydbClient.executeQuery<Event>(query, params);

      return results;
    } catch (error) {
      logger.error({ error, type: 'events_get_by_ids_failed' });
      throw error;
    }
  }
}

// Export singleton instance
export const eventRepository = new EventRepository();

