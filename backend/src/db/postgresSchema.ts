/**
 * PostgreSQL Database Schema
 * SQL schemas for PostgreSQL tables
 */

/**
 * Generate CREATE TABLE SQL for PostgreSQL
 */
export function generateCreateTableSQL(
  tableName: string,
  columns: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    primaryKey?: boolean;
    default?: string;
  }>,
  primaryKey: string[]
): string {
  const columnDefs = columns
    .map((col) => {
      let def = `  ${col.name} ${col.type}`;
      if (!col.nullable && !col.primaryKey) {
        def += ' NOT NULL';
      }
      if (col.default) {
        def += ` DEFAULT ${col.default}`;
      }
      return def;
    })
    .join(',\n');

  const pkDef = primaryKey.length > 0 ? `,\n  PRIMARY KEY (${primaryKey.join(', ')})` : '';

  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n${columnDefs}${pkDef}\n);`;
}

/**
 * Users table schema
 */
export const usersTableSQL = generateCreateTableSQL(
  'users',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'telegram_id', type: 'BIGINT', nullable: false },
    { name: 'username', type: 'VARCHAR(255)', nullable: true },
    { name: 'first_name', type: 'VARCHAR(255)', nullable: false },
    { name: 'last_name', type: 'VARCHAR(255)', nullable: true },
    { name: 'photo_url', type: 'TEXT', nullable: true },
    { name: 'bio', type: 'TEXT', nullable: true },
    { name: 'age', type: 'INTEGER', nullable: true },
    { name: 'city', type: 'VARCHAR(255)', nullable: true },
    { name: 'gender', type: 'VARCHAR(50)', nullable: true },
    { name: 'interests', type: 'TEXT[]', nullable: true },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const usersIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);',
  'CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);',
];

/**
 * Events table schema
 */
export const eventsTableSQL = generateCreateTableSQL(
  'events',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'title', type: 'VARCHAR(500)', nullable: false },
    { name: 'description', type: 'TEXT', nullable: true },
    { name: 'category', type: 'VARCHAR(255)', nullable: false },
    { name: 'image_url', type: 'TEXT', nullable: true },
    { name: 'location', type: 'VARCHAR(500)', nullable: true },
    { name: 'date', type: 'TIMESTAMP', nullable: true },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const eventsIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);',
  'CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);',
];

/**
 * Matches table schema
 */
export const matchesTableSQL = generateCreateTableSQL(
  'matches',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'user_id1', type: 'VARCHAR(255)', nullable: false },
    { name: 'user_id2', type: 'VARCHAR(255)', nullable: false },
    { name: 'event_id', type: 'VARCHAR(255)', nullable: true },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const matchesIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user_id1);',
  'CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user_id2);',
  'CREATE INDEX IF NOT EXISTS idx_matches_event ON matches(event_id);',
  'CREATE INDEX IF NOT EXISTS idx_matches_user1_user2 ON matches(user_id1, user_id2);',
  'CREATE INDEX IF NOT EXISTS idx_matches_user1_created ON matches(user_id1, created_at);',
  'CREATE INDEX IF NOT EXISTS idx_matches_user2_created ON matches(user_id2, created_at);',
];

/**
 * Likes table schema
 */
export const likesTableSQL = generateCreateTableSQL(
  'likes',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'from_user_id', type: 'VARCHAR(255)', nullable: false },
    { name: 'to_user_id', type: 'VARCHAR(255)', nullable: false },
    { name: 'event_id', type: 'VARCHAR(255)', nullable: true },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const likesIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_likes_from_user ON likes(from_user_id);',
  'CREATE INDEX IF NOT EXISTS idx_likes_to_user ON likes(to_user_id);',
  'CREATE INDEX IF NOT EXISTS idx_likes_event ON likes(event_id);',
  'CREATE INDEX IF NOT EXISTS idx_likes_from_to ON likes(from_user_id, to_user_id);',
  'CREATE INDEX IF NOT EXISTS idx_likes_from_to_event ON likes(from_user_id, to_user_id, event_id);',
  'CREATE INDEX IF NOT EXISTS idx_likes_to_created ON likes(to_user_id, created_at);',
];

/**
 * Messages table schema
 */
export const messagesTableSQL = generateCreateTableSQL(
  'messages',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'match_id', type: 'VARCHAR(255)', nullable: false },
    { name: 'sender_id', type: 'VARCHAR(255)', nullable: false },
    { name: 'content', type: 'TEXT', nullable: false },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const messagesIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);',
  'CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);',
  'CREATE INDEX IF NOT EXISTS idx_messages_match_created ON messages(match_id, created_at);',
];

/**
 * Saved events table schema
 */
export const savedEventsTableSQL = generateCreateTableSQL(
  'saved_events',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'user_id', type: 'VARCHAR(255)', nullable: false },
    { name: 'event_id', type: 'VARCHAR(255)', nullable: false },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const savedEventsIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_saved_events_user ON saved_events(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_saved_events_event ON saved_events(event_id);',
  'CREATE INDEX IF NOT EXISTS idx_saved_events_user_event ON saved_events(user_id, event_id);',
];

/**
 * Notifications table schema
 */
export const notificationsTableSQL = generateCreateTableSQL(
  'notifications',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'user_id', type: 'VARCHAR(255)', nullable: false },
    { name: 'type', type: 'VARCHAR(100)', nullable: false },
    { name: 'title', type: 'VARCHAR(500)', nullable: false },
    { name: 'message', type: 'TEXT', nullable: true },
    { name: 'data', type: 'JSONB', nullable: true },
    { name: 'read', type: 'BOOLEAN', nullable: false, default: 'false' },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const notificationsIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);',
  'CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(user_id, created_at);',
];

/**
 * Admin users table schema
 */
export const adminUsersTableSQL = generateCreateTableSQL(
  'admin_users',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'username', type: 'VARCHAR(255)', nullable: false },
    { name: 'password_hash', type: 'VARCHAR(255)', nullable: false },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const adminUsersIndexesSQL = [
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);',
];

/**
 * Admin sessions table schema
 */
export const adminSessionsTableSQL = generateCreateTableSQL(
  'admin_sessions',
  [
    { name: 'id', type: 'VARCHAR(255)', primaryKey: true },
    { name: 'admin_id', type: 'VARCHAR(255)', nullable: false },
    { name: 'refresh_token', type: 'TEXT', nullable: false },
    { name: 'expires_at', type: 'TIMESTAMP', nullable: false },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
  ],
  ['id']
);

export const adminSessionsIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);',
  'CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(refresh_token);',
  'CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);',
];

/**
 * All table creation SQL
 */
export const allTablesSQL = [
  usersTableSQL,
  eventsTableSQL,
  matchesTableSQL,
  likesTableSQL,
  messagesTableSQL,
  savedEventsTableSQL,
  notificationsTableSQL,
  adminUsersTableSQL,
  adminSessionsTableSQL,
];

/**
 * All indexes SQL
 */
export const allIndexesSQL = [
  ...usersIndexesSQL,
  ...eventsIndexesSQL,
  ...matchesIndexesSQL,
  ...likesIndexesSQL,
  ...messagesIndexesSQL,
  ...savedEventsIndexesSQL,
  ...notificationsIndexesSQL,
  ...adminUsersIndexesSQL,
  ...adminSessionsIndexesSQL,
];
