# Database Migrations

Система миграций для YDB базы данных.

## Использование

### Автоматический запуск при старте приложения

Миграции запускаются автоматически при старте backend сервера.

### Ручной запуск миграций

```bash
# Из корня проекта
npm run migrate
```

### Проверка статуса миграций

```bash
npm run migrate:status
```

## Структура миграций

Миграции определены в `backend/src/db/migrations/index.ts`.

Каждая миграция содержит:
- `id` - уникальный идентификатор (например, `001_initial_schema`)
- `name` - описание миграции
- `up` - функция для применения миграции
- `down` - опциональная функция для отката миграции

## Добавление новой миграции

1. Добавьте новую миграцию в массив `migrations` в `index.ts`:

```typescript
const newMigration: Migration = {
  id: '002_add_user_preferences',
  name: 'Add user preferences table',
  up: async () => {
    const query = `
      CREATE TABLE user_preferences (
        id String NOT NULL,
        user_id String NOT NULL,
        theme String,
        notifications Bool,
        PRIMARY KEY (id)
      );
    `;
    await ydbClient.executeQuery(query);
  },
};
```

2. Добавьте миграцию в массив:

```typescript
const migrations: Migration[] = [
  initialMigration,
  newMigration, // Добавить здесь
];
```

## Важно

- Миграции выполняются в порядке добавления в массив
- Каждая миграция выполняется только один раз
- Статус миграций хранится в таблице `migrations`
- Не изменяйте уже выполненные миграции - создавайте новые

