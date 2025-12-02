"use strict";
/**
 * YDB Database Schema
 * Defines table structures and migration scripts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.allSchemas = exports.messagesTable = exports.likesTable = exports.matchesTable = exports.eventsTable = exports.usersTable = void 0;
exports.generateCreateTableSQL = generateCreateTableSQL;
/**
 * Users table schema
 */
exports.usersTable = {
    name: 'users',
    columns: [
        { name: 'id', type: 'String' },
        { name: 'telegramId', type: 'Uint64' },
        { name: 'username', type: 'String', nullable: true },
        { name: 'firstName', type: 'String' },
        { name: 'lastName', type: 'String', nullable: true },
        { name: 'photoUrl', type: 'String', nullable: true },
        { name: 'bio', type: 'String', nullable: true },
        { name: 'age', type: 'Uint64', nullable: true },
        { name: 'createdAt', type: 'Timestamp' },
        { name: 'updatedAt', type: 'Timestamp' },
    ],
    primaryKey: ['id'],
    indexes: [
        { name: 'idx_telegram_id', columns: ['telegramId'] },
    ],
};
/**
 * Events table schema
 */
exports.eventsTable = {
    name: 'events',
    columns: [
        { name: 'id', type: 'String' },
        { name: 'title', type: 'String' },
        { name: 'description', type: 'String' },
        { name: 'category', type: 'String' },
        { name: 'imageUrl', type: 'String', nullable: true },
        { name: 'location', type: 'String', nullable: true },
        { name: 'date', type: 'Timestamp', nullable: true },
        { name: 'createdAt', type: 'Timestamp' },
        { name: 'updatedAt', type: 'Timestamp' },
    ],
    primaryKey: ['id'],
    indexes: [
        { name: 'idx_category', columns: ['category'] },
        { name: 'idx_date', columns: ['date'] },
    ],
};
/**
 * Matches table schema
 */
exports.matchesTable = {
    name: 'matches',
    columns: [
        { name: 'id', type: 'String' },
        { name: 'userId1', type: 'String' },
        { name: 'userId2', type: 'String' },
        { name: 'eventId', type: 'String', nullable: true },
        { name: 'createdAt', type: 'Timestamp' },
    ],
    primaryKey: ['id'],
    indexes: [
        { name: 'idx_user1', columns: ['userId1'] },
        { name: 'idx_user2', columns: ['userId2'] },
        { name: 'idx_event', columns: ['eventId'] },
    ],
};
/**
 * Likes table schema
 */
exports.likesTable = {
    name: 'likes',
    columns: [
        { name: 'id', type: 'String' },
        { name: 'fromUserId', type: 'String' },
        { name: 'toUserId', type: 'String' },
        { name: 'eventId', type: 'String', nullable: true },
        { name: 'createdAt', type: 'Timestamp' },
    ],
    primaryKey: ['id'],
    indexes: [
        { name: 'idx_from_user', columns: ['fromUserId'] },
        { name: 'idx_to_user', columns: ['toUserId'] },
        { name: 'idx_event', columns: ['eventId'] },
        { name: 'idx_from_to', columns: ['fromUserId', 'toUserId'] },
    ],
};
/**
 * Messages table schema
 */
exports.messagesTable = {
    name: 'messages',
    columns: [
        { name: 'id', type: 'String' },
        { name: 'matchId', type: 'String' },
        { name: 'senderId', type: 'String' },
        { name: 'content', type: 'String' },
        { name: 'createdAt', type: 'Timestamp' },
    ],
    primaryKey: ['id'],
    indexes: [
        { name: 'idx_match', columns: ['matchId'] },
        { name: 'idx_sender', columns: ['senderId'] },
        { name: 'idx_match_created', columns: ['matchId', 'createdAt'] },
    ],
};
/**
 * Generate CREATE TABLE SQL for YDB
 */
function generateCreateTableSQL(schema) {
    const columns = schema.columns
        .map((col) => {
        const nullable = col.nullable ? '' : ' NOT NULL';
        return `  ${col.name} ${col.type}${nullable}`;
    })
        .join(',\n');
    const primaryKey = `PRIMARY KEY (${schema.primaryKey.join(', ')})`;
    return `CREATE TABLE ${schema.name} (\n${columns},\n  ${primaryKey}\n);`;
}
/**
 * All table schemas
 */
exports.allSchemas = [
    exports.usersTable,
    exports.eventsTable,
    exports.matchesTable,
    exports.likesTable,
    exports.messagesTable,
];
