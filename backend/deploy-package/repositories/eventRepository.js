"use strict";
/**
 * Event Repository
 * Handles all database operations for events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRepository = exports.EventRepository = void 0;
const connection_1 = require("../db/connection");
const logger_1 = require("../logger");
class EventRepository {
    /**
     * Create event
     */
    async createEvent(event) {
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
            await connection_1.ydbClient.executeQuery(query, params);
            logger_1.logger.info({ type: 'event_created', eventId: event.id });
            return event;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'event_create_failed', eventId: event.id });
            throw error;
        }
    }
    /**
     * Get event by ID
     */
    async getEventById(eventId) {
        try {
            const query = `
        SELECT * FROM events WHERE id = $id;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, { id: eventId });
            return results[0] || null;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'event_get_failed', eventId });
            throw error;
        }
    }
    /**
     * Get events by category
     */
    async getEventsByCategory(category, limit = 20, offset = 0) {
        try {
            const query = `
        SELECT * FROM events 
        WHERE category = $category
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, {
                category,
                limit,
                offset,
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'events_get_by_category_failed', category });
            throw error;
        }
    }
    /**
     * Get all events with pagination
     */
    async getEvents(limit = 20, offset = 0) {
        try {
            const query = `
        SELECT * FROM events 
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, {
                limit,
                offset,
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'events_get_failed' });
            throw error;
        }
    }
    /**
     * Get all events with pagination (for admin)
     */
    async getAllEvents(limit = 50, offset = 0) {
        try {
            const query = `
        SELECT * FROM events 
        ORDER BY createdAt DESC
        LIMIT $limit OFFSET $offset;
      `;
            const results = await connection_1.ydbClient.executeQuery(query, {
                limit,
                offset,
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'events_get_all_failed' });
            throw error;
        }
    }
    /**
     * Get total events count
     */
    async getEventsCount() {
        try {
            const query = `
        SELECT COUNT(*) as count FROM events;
      `;
            const results = await connection_1.ydbClient.executeQuery(query);
            return results[0]?.count || 0;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'events_count_failed' });
            throw error;
        }
    }
    /**
     * Update event
     */
    async updateEvent(eventId, updates) {
        try {
            const setClause = [];
            const params = { id: eventId };
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
                return await this.getEventById(eventId) || {};
            }
            const query = `
        UPDATE events SET ${setClause.join(', ')} WHERE id = $id;
      `;
            await connection_1.ydbClient.executeQuery(query, params);
            // Fetch updated event
            const updatedEvent = await this.getEventById(eventId);
            if (!updatedEvent) {
                throw new Error('Event not found after update');
            }
            logger_1.logger.info({ type: 'event_updated', eventId });
            return updatedEvent;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'event_update_failed', eventId });
            throw error;
        }
    }
    /**
     * Delete event
     */
    async deleteEvent(eventId) {
        try {
            const query = `
        DELETE FROM events WHERE id = $id;
      `;
            await connection_1.ydbClient.executeQuery(query, { id: eventId });
            logger_1.logger.info({ type: 'event_deleted', eventId });
            return true;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'event_delete_failed', eventId });
            throw error;
        }
    }
    /**
     * Get events by IDs
     */
    async getEventsByIds(eventIds) {
        try {
            if (eventIds.length === 0) {
                return [];
            }
            // YDB supports IN with parameterized values
            // Build query with OR conditions for better compatibility
            if (eventIds.length === 1) {
                const query = `SELECT * FROM events WHERE id = $id0;`;
                const results = await connection_1.ydbClient.executeQuery(query, { id0: eventIds[0] });
                return results;
            }
            // For multiple IDs, use OR conditions
            const conditions = eventIds.map((_, index) => `id = $id${index}`).join(' OR ');
            const query = `SELECT * FROM events WHERE ${conditions};`;
            const params = {};
            eventIds.forEach((id, index) => {
                params[`id${index}`] = id;
            });
            const results = await connection_1.ydbClient.executeQuery(query, params);
            return results;
        }
        catch (error) {
            logger_1.logger.error({ error, type: 'events_get_by_ids_failed' });
            throw error;
        }
    }
}
exports.EventRepository = EventRepository;
// Export singleton instance
exports.eventRepository = new EventRepository();
