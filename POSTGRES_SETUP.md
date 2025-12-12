# Настройка PostgreSQL для проекта

## Информация о базе данных

- **Имя кластера**: events-db
- **Идентификатор кластера**: c9q4gv1sc637oll0o73j
- **База данных**: events_db
- **Пользователь**: events_user

## Получение connection string

### Вариант 1: Через Yandex Cloud Console

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в раздел Managed PostgreSQL
3. Выберите кластер `events-db` (ID: `c9q4gv1sc637oll0o73j`)
4. Перейдите на вкладку "Хосты"
5. Скопируйте FQDN хоста
6. Перейдите на вкладку "Пользователи"
7. Найдите пользователя `events_user` и получите пароль

### Вариант 2: Через Yandex Cloud CLI

```bash
# Получить информацию о хостах
yc managed-postgresql cluster list-hosts --id c9q4gv1sc637oll0o73j

# Получить пароль пользователя
yc managed-postgresql user get --name events_user --cluster-id c9q4gv1sc637oll0o73j
```

## Формат connection string

```
postgresql://events_user:PASSWORD@HOST:6432/events_db?sslmode=require
```

Где:

- `PASSWORD` - пароль пользователя events_user
- `HOST` - FQDN хоста из консоли
- `6432` - порт PostgreSQL (обычно 6432 для Managed PostgreSQL)
- `events_db` - имя базы данных

## Настройка .env файла

Добавьте в `.env` файл:

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://events_user:PASSWORD@HOST:6432/events_db?sslmode=require

# Или используйте отдельную переменную
POSTGRES_CONNECTION_STRING=postgresql://events_user:PASSWORD@HOST:6432/events_db?sslmode=require
```

## Запуск миграций

После настройки connection string выполните:

```bash
cd backend
npm run migrate:postgres
```

Или напрямую:

```bash
tsx backend/src/db/migrations/run-postgres.ts
```

## Проверка подключения

```bash
tsx scripts/test-postgres-connection.ts
```

## Важные замечания

1. **SSL обязателен**: Managed PostgreSQL требует SSL подключение (`sslmode=require`)
2. **Порт**: Обычно используется порт 6432 для Managed PostgreSQL
3. **Безопасность**: Никогда не коммитьте пароли в репозиторий
4. **Firewall**: Убедитесь, что ваш IP добавлен в список разрешенных в настройках кластера

## Следующие шаги

1. Получите connection string
2. Добавьте его в `.env` файл
3. Запустите миграции
4. Протестируйте подключение
