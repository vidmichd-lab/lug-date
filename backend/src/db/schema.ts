/**
 * YDB Database Schema
 * Defines table structures and migration scripts
 */

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  primaryKey: string[];
  indexes?: IndexDefinition[];
}

export interface ColumnDefinition {
  name: string;
  type: 'String' | 'Uint64' | 'Int64' | 'Timestamp' | 'Bool' | 'Json';
  nullable?: boolean;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
}

/**
 * Users table schema
 */
export const usersTable: TableSchema = {
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
  indexes: [{ name: 'idx_telegram_id', columns: ['telegramId'] }],
};

/**
 * Events table schema
 */
export const eventsTable: TableSchema = {
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
export const matchesTable: TableSchema = {
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
    // Composite indexes for performance (created in migration 003)
    { name: 'idx_user1_user2', columns: ['userId1', 'userId2'] },
    { name: 'idx_user1_created', columns: ['userId1', 'createdAt'] },
    { name: 'idx_user2_created', columns: ['userId2', 'createdAt'] },
  ],
};

/**
 * Likes table schema
 */
export const likesTable: TableSchema = {
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
    // Composite indexes for performance (created in migration 003)
    { name: 'idx_from_to_event', columns: ['fromUserId', 'toUserId', 'eventId'] },
    { name: 'idx_to_created', columns: ['toUserId', 'createdAt'] },
  ],
};

/**
 * Messages table schema
 */
export const messagesTable: TableSchema = {
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
export function generateCreateTableSQL(schema: TableSchema): string {
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
export const allSchemas: TableSchema[] = [
  usersTable,
  eventsTable,
  matchesTable,
  likesTable,
  messagesTable,
];
