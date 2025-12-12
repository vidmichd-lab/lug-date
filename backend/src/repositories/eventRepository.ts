/**
 * Event Repository
 * Handles all database operations for events
 */

import { postgresClient } from '../db/postgresConnection';
import { logger } from '../logger';
import type { Event } from '@dating-app/shared';

export class EventRepository {
  /**
   * Create event
   */
  async createEvent(event: Event): Promise<Event> {
    try {
      const query = `
        INSERT INTO events (id, title, description, category, image_url, location, date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `;

      const params = [
        event.id,
        event.title,
        event.description,
        event.category,
        event.imageUrl || null,
        event.location || null,
        event.date || null,
        event.createdAt || new Date(),
        event.updatedAt || new Date(),
      ];

      await postgresClient.executeQuery(query, params);
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
        SELECT 
          id,
          title,
          description,
          category,
          image_url as "imageUrl",
          location,
          date,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM events 
        WHERE id = $1;
      `;

      const results = await postgresClient.executeQuery<any>(query, [eventId]);

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
        SELECT 
          id,
          title,
          description,
          category,
          image_url as "imageUrl",
          location,
          date,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM events 
        WHERE category = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;
      `;

      const results = await postgresClient.executeQuery<any>(query, [category, limit, offset]);

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
        SELECT 
          id,
          title,
          description,
          category,
          image_url as "imageUrl",
          location,
          date,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM events 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `;

      const results = await postgresClient.executeQuery<any>(query, [limit, offset]);

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
        SELECT 
          id,
          title,
          description,
          category,
          image_url as "imageUrl",
          location,
          date,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM events 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `;

      const results = await postgresClient.executeQuery<any>(query, [limit, offset]);

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
      const query = `SELECT COUNT(*) as count FROM events;`;

      const results = await postgresClient.executeQuery<{ count: string }>(query);

      return parseInt(results[0]?.count || '0', 10);
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
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.title !== undefined) {
        setClause.push(`title = $${paramIndex++}`);
        params.push(updates.title);
      }
      if (updates.description !== undefined) {
        setClause.push(`description = $${paramIndex++}`);
        params.push(updates.description);
      }
      if (updates.category !== undefined) {
        setClause.push(`category = $${paramIndex++}`);
        params.push(updates.category);
      }
      if (updates.imageUrl !== undefined) {
        setClause.push(`image_url = $${paramIndex++}`);
        params.push(updates.imageUrl);
      }
      if (updates.location !== undefined) {
        setClause.push(`location = $${paramIndex++}`);
        params.push(updates.location);
      }
      if (updates.date !== undefined) {
        setClause.push(`date = $${paramIndex++}`);
        params.push(updates.date);
      }

      setClause.push(`updated_at = $${paramIndex++}`);
      params.push(new Date());

      if (setClause.length === 1) {
        // Only updatedAt, no need to update
        return (await this.getEventById(eventId)) || ({} as Event);
      }

      params.push(eventId); // For WHERE clause

      const query = `
        UPDATE events SET ${setClause.join(', ')} WHERE id = $${paramIndex};
      `;

      await postgresClient.executeQuery(query, params);

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
      const query = `DELETE FROM events WHERE id = $1;`;

      await postgresClient.executeQuery(query, [eventId]);

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

      // PostgreSQL supports IN with array
      const placeholders = eventIds.map((_, index) => `$${index + 1}`).join(', ');
      const query = `
        SELECT 
          id,
          title,
          description,
          category,
          image_url as "imageUrl",
          location,
          date,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM events 
        WHERE id IN (${placeholders});
      `;

      const results = await postgresClient.executeQuery<any>(query, eventIds);

      return results;
    } catch (error) {
      logger.error({ error, type: 'events_get_by_ids_failed' });
      throw error;
    }
  }
}

// Export singleton instance
export const eventRepository = new EventRepository();
