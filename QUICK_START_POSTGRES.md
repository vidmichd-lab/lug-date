# Быстрый старт с PostgreSQL

## Шаг 1: Получить connection string

### Вариант A: Через Yandex Cloud Console

1. Откройте https://console.cloud.yandex.ru/
2. Перейдите в **Managed PostgreSQL**
3. Выберите кластер `events-db` (ID: `c9q4gv1sc637oll0o73j`)
4. **Хосты** → скопируйте FQDN хоста
5. **Пользователи** → найдите `events_user` → получите пароль

### Вариант B: Через CLI

```bash
# Получить хосты
yc managed-postgresql cluster list-hosts --id c9q4gv1sc637oll0o73j

# Получить информацию о пользователе
yc managed-postgresql user get --name events_user --cluster-id c9q4gv1sc637oll0o73j
```

## Шаг 2: Добавить в .env

Connection string уже добавлен в `.env`:

```env
DATABASE_URL=postgresql://events_user:BIa8gxlSjYRw3E8Q@rc1a-0cfp3m8m0t4ah677.mdb.yandexcloud.net:6432/events_db?sslmode=require
```

**⚠️ Важно:** Если хост не резолвится (ENOTFOUND), нужно:

1. Включить публичный доступ для кластера в Yandex Cloud Console
2. Добавить ваш IP в whitelist
3. Проверить правильность FQDN хоста

См. `POSTGRES_CONNECTION_FIX.md` для детальных инструкций.

## Шаг 3: Запустить миграции

```bash
cd backend
npm run migrate:postgres
```

Ожидаемый вывод:

```
🔄 Starting PostgreSQL migrations...

1. Connecting to PostgreSQL...
   ✅ Connected

2. Running migrations...
   ✅ Migrations completed

📊 Migration Status:
   Executed: 1
   Pending: 0

✅ All migrations completed successfully!
```

## Шаг 4: Протестировать подключение

```bash
npm run test:postgres
```

Ожидаемый вывод:

```
🔌 Testing PostgreSQL connection...

1. Initializing PostgreSQL connection...
2. Checking connection status...
   Status: ✅ Connected

3. Testing simple query...
   ✅ Query successful:
      Current time: 2025-12-11T...
      PostgreSQL version: PostgreSQL 15...

4. Checking tables...
   ✅ Found 9 tables:
      - admin_sessions
      - admin_users
      - events
      - likes
      - matches
      - messages
      - notifications
      - saved_events
      - users

✅ Connection test completed!
```

## Шаг 5: Запустить backend

```bash
npm run dev:backend
```

Проверить:

```bash
curl http://localhost:4000/health
```

Должен вернуть:

```json
{
  "status": "ok",
  "service": "backend",
  "database": "connected",
  "timestamp": "2025-12-11T..."
}
```

## Готово! 🎉

Проект полностью переключен на PostgreSQL!

## Полезные команды

```bash
# Проверить подключение
npm run test:postgres

# Запустить миграции
npm run migrate:postgres

# Проверить статус миграций
npm run migrate:status:postgres

# Запустить backend
npm run dev:backend

# Запустить все компоненты
npm run dev:all
```

## Решение проблем

### Ошибка ENOTFOUND (хост не найден)

Если получаете ошибку `getaddrinfo ENOTFOUND`, это означает, что:

1. **Публичный доступ не включен** - включите в Yandex Cloud Console:
   - Managed PostgreSQL → кластер `events-db` → Хосты → Настроить → Включить публичный доступ
2. **Ваш IP не в whitelist** - добавьте ваш IP в настройках сетевого доступа
3. **Неправильный FQDN** - проверьте правильность хоста в консоли
4. **Проблема с DNS в Node.js** - если системные утилиты резолвят хост, но Node.js нет, используйте IP адрес напрямую в connection string

### Ошибка SSL сертификата

Если получаете ошибку `self-signed certificate in certificate chain`:

- Код уже настроен для работы с self-signed сертификатами Yandex Cloud
- Убедитесь, что в `postgresConnection.ts` установлено `rejectUnauthorized: false` в настройках SSL

### Ошибка подключения

1. Проверьте правильность connection string
2. Убедитесь, что SSL настроен правильно (код автоматически обрабатывает self-signed сертификаты)
3. Проверьте, что ваш IP добавлен в firewall кластера
4. Проверьте правильность порта (обычно 6432)

### Ошибка миграций

1. Убедитесь, что connection string настроен
2. Проверьте права пользователя `events_user`
3. Убедитесь, что база данных `events_db` существует

### Backend не запускается

1. Проверьте логи на наличие ошибок
2. Убедитесь, что миграции выполнены
3. Проверьте health check endpoint
