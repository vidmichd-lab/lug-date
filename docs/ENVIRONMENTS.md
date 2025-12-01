# Настройка окружений

Проект поддерживает два окружения: **production** и **development**.

## Переключение окружений

Окружение определяется переменной `NODE_ENV`:

- `NODE_ENV=production` → продакшн база данных и бот
- `NODE_ENV=development` → тестовая база данных и бот

## Переменные окружения

Создайте файл `.env` в корне проекта на основе `.env.example`:

```bash
# Environment
NODE_ENV=development

# Telegram Bot Tokens
TELEGRAM_BOT_TOKEN_PROD=8232314768:AAEabExGz6iDfe2wTrDSB600Qu97kyl1ta4
TELEGRAM_BOT_TOKEN_DEV=8232314768:AAEabExGz6iDfe2wTrDSB600Qu97kyl1ta4

# YDB Database (Production)
YDB_ENDPOINT_PROD=your-prod-endpoint
YDB_DATABASE_PROD=your-prod-database
YDB_TOKEN_PROD=your-prod-token

# YDB Database (Development)
YDB_ENDPOINT_DEV=your-dev-endpoint
YDB_DATABASE_DEV=your-dev-database
YDB_TOKEN_DEV=your-dev-token

# Error Monitoring (для России - альтернатива Sentry)
# Yandex AppMetrica (рекомендуется)
VITE_YANDEX_METRICA_ID=

# Catcher (российский аналог Sentry)
VITE_CATCHER_API_KEY=
VITE_CATCHER_PROJECT_ID=
CATCHER_API_KEY=
CATCHER_PROJECT_ID=

# Logging
LOG_LEVEL=info  # debug | info | warn | error
YANDEX_CLOUD_LOGGING_ENABLED=true

# Alerts
TELEGRAM_ALERT_ENABLED=true
TELEGRAM_ALERT_BOT_TOKEN=your-alert-bot-token
TELEGRAM_ALERT_CHAT_ID=your-chat-id

EMAIL_ALERT_ENABLED=false
```

## Использование

### Development режим

```bash
# Запуск всех сервисов в dev режиме
NODE_ENV=development npm run dev:all

# Или отдельно
NODE_ENV=development npm run dev:backend
NODE_ENV=development npm run dev:bot
NODE_ENV=development npm run dev:frontend
```

### Production режим

```bash
# Запуск в production режиме
NODE_ENV=production npm run start

# Или для деплоя
NODE_ENV=production npm run deploy:prod
```

## Seed данных для разработки

Для наполнения тестовой базы данных используйте команду:

```bash
npm run seed:dev
```

Скрипт создаст:
- 50 пользователей с фейковыми фото
- 20 событий в разных категориях
- 200 случайных лайков
- Несколько матчей на основе взаимных лайков

**Важно:** Скрипт работает только в `development` режиме и не может быть запущен в `production`.

## Отладка в Telegram WebView

В development режиме автоматически подключается **Eruda** - инструмент для отладки в мобильных браузерах.

Eruda предоставляет:
- Консоль браузера прямо в приложении
- Network inspector для просмотра запросов
- Storage viewer для просмотра localStorage/sessionStorage
- Elements inspector для DOM

Eruda загружается только в dev режиме и не включается в production сборку.

