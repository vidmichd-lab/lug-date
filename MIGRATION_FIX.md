# Исправления для миграций

## Проблема

Миграции не запускались из-за:

1. `initYDB()` в development режиме не бросала ошибку при неудаче подключения
2. Использовались устаревшие поля `endpoint` и `database` вместо `connectionString`

## Исправления

### 1. Создана функция `initYDBForMigrations()`

**Файл:** `backend/src/db/connection.ts`

Новая функция всегда требует подключения (бросает ошибку при неудаче), в отличие от `initYDB()`, которая в development позволяет приложению запуститься без БД.

### 2. Обновлены скрипты миграций

**Файлы:**

- `backend/src/db/migrations/run.ts` - использует `initYDBForMigrations()`
- `backend/src/db/migrations/status.ts` - использует `initYDBForMigrations()`

### 3. Обновлен формат подключения к YDB

**Файл:** `backend/src/db/connection.ts`

Теперь используется `connectionString` вместо устаревших `endpoint` и `database`:

```typescript
const connectionString = `${endpoint}?database=${encodeURIComponent(database)}`;
```

## Текущая ошибка

Если миграции все еще не работают, возможные причины:

1. **Timeout подключения** - проверьте:
   - Правильность `YDB_ENDPOINT_DEV` (должен быть типа `grpcs://ydb.serverless.yandexcloud.net:2135`)
   - Правильность `YDB_DATABASE_DEV` (должен быть типа `/ru-central1/b1g.../etn...`)
   - Наличие `YC_SERVICE_ACCOUNT_KEY_FILE` или `YDB_TOKEN_DEV` в `.env`

2. **Проблемы с credentials** - проверьте:
   - Файл `yc-service-account-key.json` существует и содержит валидный JSON
   - Или `YDB_TOKEN_DEV` содержит валидный токен

3. **Сетевые проблемы** - проверьте:
   - Доступность endpoint из вашей сети
   - Firewall не блокирует подключение

## Проверка

```bash
# Проверить переменные
node -e "require('dotenv').config(); console.log('Endpoint:', process.env.YDB_ENDPOINT_DEV); console.log('Database:', process.env.YDB_DATABASE_DEV);"

# Попробовать запустить миграции
npm run migrate
```

## Следующие шаги

Если проблема сохраняется, проверьте логи более детально:

```bash
LOG_LEVEL=debug npm run migrate
```
