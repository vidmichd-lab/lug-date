# Мониторинг и логирование

Проект использует Sentry для отслеживания ошибок и Pino для структурированного логирования.

## Sentry

### Настройка

1. Создайте проект на [sentry.io](https://sentry.io) (бесплатно до 5K ошибок/месяц)
2. Получите DSN для вашего проекта
3. Добавьте в `.env`:

```bash
# Frontend
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Backend
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENABLE_DEV=false  # Set to true to enable in development
```

### Frontend

Sentry автоматически инициализируется в `main.tsx` и включает:
- **Browser Tracing** - мониторинг производительности
- **Session Replay** - запись сессий пользователей при ошибках
- **Error Tracking** - автоматический сбор ошибок

### Backend

Sentry интегрирован через middleware:
- Автоматический сбор необработанных ошибок
- Трекинг производительности API
- Профилирование (profiling)

## Логирование

### Структура логов

Все логи структурированы в JSON формате:

```json
{
  "level": "info",
  "time": "2024-01-01T12:00:00.000Z",
  "env": "production",
  "service": "backend",
  "type": "http_request",
  "method": "GET",
  "url": "/api/v1/matches",
  "statusCode": 200,
  "responseTime": 45
}
```

### Типы логов

#### HTTP запросы
Автоматически логируются все запросы к API с временем ответа.

#### Создание матчей
```typescript
import { logMatch } from './logger';

logMatch(matchId, userId1, userId2, eventId);
```

#### Ошибки загрузки фото
```typescript
import { logPhotoError } from './logger';

try {
  // upload photo
} catch (error) {
  logPhotoError(error, userId, photoUrl);
}
```

### Уровни логирования

- `error` - ошибки, требующие внимания
- `warn` - предупреждения
- `info` - информационные сообщения (по умолчанию в production)
- `debug` - отладочная информация (только в development)

Установить уровень:
```bash
LOG_LEVEL=debug npm run dev:backend
```

## Yandex Cloud Logging

В production режиме логи автоматически форматируются для Yandex Cloud Logging.

Для интеграции:
1. Настройте сервисный аккаунт в Yandex Cloud
2. Установите переменную окружения:
```bash
YANDEX_CLOUD_LOGGING_ENABLED=true
```

Логи будут автоматически отправляться в Yandex Cloud Logging для хранения и поиска.

## Алерты

### Настройка

#### Telegram
```bash
TELEGRAM_ALERT_ENABLED=true
TELEGRAM_ALERT_BOT_TOKEN=your-bot-token
TELEGRAM_ALERT_CHAT_ID=your-chat-id
```

#### Email
```bash
EMAIL_ALERT_ENABLED=true
# Настройте интеграцию с SendGrid, AWS SES и т.д.
# См. backend/src/alerts.ts для примера
```

### Использование

```typescript
import { sendCriticalAlert, sendErrorAlert } from './alerts';

// Критическая ошибка (падение сервера)
await sendCriticalAlert('Database connection lost', error, {
  database: 'ydb',
  endpoint: 'ydb.serverless.yandexcloud.net',
});

// Обычная ошибка
await sendErrorAlert('Failed to process payment', error, {
  userId: '123',
  amount: 100,
});
```

### Когда отправляются алерты

- **Критические ошибки**: автоматически при `uncaughtException` и `unhandledRejection`
- **Ошибки загрузки фото**: автоматически при ошибках в `/api/v1/photos`
- **Произвольные алерты**: через функции `sendCriticalAlert` и `sendErrorAlert`

## Мониторинг в Sentry

### Дашборды

1. **Issues** - список всех ошибок
2. **Performance** - метрики производительности API
3. **Releases** - отслеживание версий приложения
4. **Alerts** - настройка уведомлений

### Настройка алертов в Sentry

1. Перейдите в Settings → Alerts
2. Создайте правило:
   - **Trigger**: когда количество ошибок превышает порог
   - **Action**: отправка в Telegram/Email

### Release Tracking

Установите версию приложения:
```bash
# Frontend
VITE_APP_VERSION=1.0.0

# Backend
APP_VERSION=1.0.0
```

## Best Practices

1. **Не логируйте чувствительные данные** (пароли, токены, персональные данные)
2. **Используйте структурированное логирование** - всегда передавайте контекст
3. **Логируйте на правильном уровне** - error для ошибок, info для важных событий
4. **Мониторьте Sentry регулярно** - проверяйте новые ошибки
5. **Настройте алерты** - получайте уведомления о критических проблемах

## Примеры

### Логирование запроса с контекстом

```typescript
import { logger } from './logger';

logger.info({
  type: 'user_action',
  action: 'profile_updated',
  userId: '123',
  changes: ['name', 'photo'],
});
```

### Обработка ошибок с контекстом

```typescript
try {
  // some operation
} catch (error) {
  logError(error, {
    operation: 'process_payment',
    userId: '123',
    amount: 100,
  });
  throw error;
}
```

