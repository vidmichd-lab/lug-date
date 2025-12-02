# Полный деплой всех компонентов

## Что было сделано

### 1. Автоматическая регистрация пользователей через Telegram

- При первом запросе через Telegram WebApp пользователь автоматически создается в базе данных
- Используются данные из Telegram initData (имя, фамилия, username, фото)
- Регистрация происходит прозрачно при первом обращении к API

### 2. Обновлен deploy.yml для деплоя всех компонентов

- **Backend**: Использует Serverless Containers (Docker образы)
- **Frontend**: Деплоится в Yandex Object Storage
- **Admin**: Деплоится в Yandex Object Storage
- **Bot**: Деплоится в Yandex Cloud Functions

### 3. Обновления

- Node.js обновлен до версии 20
- Используются контейнеры вместо functions для backend
- Добавлен деплой admin панели

## Необходимые GitHub Secrets

### Обязательные для всех компонентов:

```
YC_SERVICE_ACCOUNT_KEY      # JSON ключ сервисного аккаунта
YC_SERVICE_ACCOUNT_ID       # ID сервисного аккаунта (aje...)
YC_FOLDER_ID                # ID каталога (b1g...)
YC_REGISTRY_ID              # ID Container Registry (crp...)
```

### Backend (Staging):

```
YC_CONTAINER_ID_STAGING     # ID контейнера (опционально, можно получить после первого деплоя)
TELEGRAM_BOT_TOKEN_DEV      # Токен Telegram бота для разработки
YDB_ENDPOINT_DEV            # grpcs://ydb.serverless.yandexcloud.net:2135
YDB_DATABASE_DEV            # /ru-central1/b1g.../etn...
YANDEX_STORAGE_BUCKET_DEV   # Имя bucket для файлов
YANDEX_STORAGE_ACCESS_KEY_DEV
YANDEX_STORAGE_SECRET_KEY_DEV
```

### Backend (Production):

```
YC_CONTAINER_ID_PROD        # ID контейнера (опционально)
TELEGRAM_BOT_TOKEN_PROD     # Токен Telegram бота для продакшена
YDB_ENDPOINT_PROD
YDB_DATABASE_PROD
YANDEX_STORAGE_BUCKET_PROD
YANDEX_STORAGE_ACCESS_KEY_PROD
YANDEX_STORAGE_SECRET_KEY_PROD
```

### Frontend:

```
YANDEX_STORAGE_BUCKET_DEV   # Bucket для frontend (staging)
YANDEX_STORAGE_BUCKET_PROD  # Bucket для frontend (production)
```

### Admin:

```
ADMIN_STORAGE_BUCKET_DEV
ADMIN_STORAGE_ACCESS_KEY_DEV
ADMIN_STORAGE_SECRET_KEY_DEV
ADMIN_STORAGE_BUCKET_PROD
ADMIN_STORAGE_ACCESS_KEY_PROD
ADMIN_STORAGE_SECRET_KEY_PROD
```

### Bot:

```
YC_BOT_FUNCTION_ID_STAGING  # ID функции для бота (staging)
YC_BOT_FUNCTION_ID_PROD     # ID функции для бота (production)
```

### Alerts (опционально):

```
TELEGRAM_ALERT_BOT_TOKEN
TELEGRAM_ALERT_CHAT_ID
```

## Как работает регистрация через Telegram

1. Пользователь открывает Telegram WebApp
2. Telegram передает `initData` в заголовке `Authorization: Bearer <initData>`
3. Backend валидирует `initData` через `telegramAuthMiddleware`
4. При первом запросе к `/api/v1/user/profile`:
   - Если пользователь не найден в БД → автоматически создается
   - Используются данные из Telegram (имя, фамилия, username, фото)
   - Пользователь получает свой профиль

## Проверка деплоя

После деплоя проверьте:

1. **Backend Health Check:**

   ```bash
   curl https://<container-url>/health
   ```

2. **Frontend:**
   - Откройте URL из Object Storage
   - Проверьте что приложение загружается

3. **Admin:**
   - Откройте URL из Object Storage
   - Проверьте доступ к админ-панели

4. **Bot:**
   - Отправьте команду боту в Telegram
   - Проверьте что бот отвечает

## Логи и отладка

```bash
# Логи backend контейнера
yc serverless container logs --name=lug-date-backend-staging --folder-id=<folder-id>

# Логи бота
yc serverless function logs --id=<bot-function-id>

# Статус контейнера
yc serverless container get --name=lug-date-backend-staging --folder-id=<folder-id>
```

## Следующие шаги

1. Убедитесь что все secrets настроены в GitHub
2. Проверьте что база данных YDB создана и доступна
3. Проверьте что Object Storage buckets созданы
4. Запустите деплой через push в develop или вручную через GitHub Actions
