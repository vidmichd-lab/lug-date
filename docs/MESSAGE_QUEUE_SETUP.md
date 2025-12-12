# Настройка Message Queue для уведомлений

## Обзор

Система использует Yandex Message Queue (YMQ) для асинхронной отправки уведомлений о матчах. YMQ совместим с AWS SQS API, поэтому используется `@aws-sdk/client-sqs`.

## Преимущества

- ✅ Асинхронная обработка - не блокирует создание матча
- ✅ Автоматический retry при ошибках
- ✅ Гарантия доставки сообщений
- ✅ Масштабируемость - можно обрабатывать много сообщений параллельно

## Настройка

### 1. Создать очередь в Yandex Cloud

```bash
# Через Yandex Cloud CLI
yc message-queue queue create \
  --name match-notifications \
  --fifo false \
  --visibility-timeout 30 \
  --message-retention-period 1209600  # 14 дней
```

Или через консоль:

1. Перейти в Yandex Cloud Console → Message Queue
2. Создать очередь `match-notifications`
3. Настроить visibility timeout: 30 секунд
4. Настроить message retention: 14 дней

### 2. Получить credentials

```bash
# Создать сервисный аккаунт для доступа к очереди
yc iam service-account create --name queue-access

# Назначить роль
yc resource-manager folder add-access-binding <folder-id> \
  --role message-queue.writer \
  --subject serviceAccount:<service-account-id>

# Создать статический ключ
yc iam access-key create --service-account-name queue-access
```

### 3. Настроить переменные окружения

**Backend (.env):**

```bash
# Yandex Message Queue
YMQ_ENDPOINT=https://message-queue.api.cloud.yandex.net
YMQ_QUEUE_URL=https://message-queue.api.cloud.yandex.net/<folder-id>/<queue-name>
YMQ_ACCESS_KEY_ID=<access-key-id>
YMQ_SECRET_ACCESS_KEY=<secret-access-key>

# Fallback (если очередь не настроена)
BOT_WEBHOOK_URL=http://localhost:3001/notify/match
```

**Bot (.env):**

```bash
# Yandex Message Queue
YMQ_ENDPOINT=https://message-queue.api.cloud.yandex.net
YMQ_QUEUE_URL=https://message-queue.api.cloud.yandex.net/<folder-id>/<queue-name>
YMQ_ACCESS_KEY_ID=<access-key-id>
YMQ_SECRET_ACCESS_KEY=<secret-access-key>

# Backend URL (для получения данных пользователей, если нужно)
BACKEND_URL=http://localhost:4000
FRONTEND_URL=https://app.yourdomain.com
```

## Как это работает

### Backend (отправка в очередь)

1. При создании матча в `routes/matches.ts`:
   - Получаем telegram IDs пользователей из БД
   - Отправляем сообщение в очередь через `sendMatchNotification()`

2. `services/queue.ts`:
   - Если очередь настроена → отправляет в YMQ
   - Если очередь не настроена → fallback на прямой webhook
   - Если очередь недоступна → fallback на прямой webhook

### Bot (обработка из очереди)

1. При запуске бота в `bot/src/index.ts`:
   - Запускается `startQueueConsumer()` в фоне
   - Consumer постоянно опрашивает очередь (long polling)

2. `bot/src/queueConsumer.ts`:
   - Получает сообщения из очереди
   - Обрабатывает каждое сообщение
   - Отправляет уведомления пользователям через Telegram
   - Удаляет сообщение из очереди после успешной обработки

## Retry механизм

- Если обработка сообщения не удалась, сообщение автоматически возвращается в очередь через visibility timeout
- После нескольких неудачных попыток сообщение можно отправить в dead letter queue (настроить отдельно)

## Мониторинг

Логи в формате:

```json
{
  "type": "match_notification_queued",
  "matchId": "match-123",
  "telegramId1": 123456789,
  "telegramId2": 987654321
}
```

## Fallback режим

Если очередь не настроена, система автоматически использует прямой webhook:

- Backend отправляет POST запрос на `BOT_WEBHOOK_URL`
- Bot должен обработать этот webhook (можно добавить endpoint)

Это позволяет работать в development без настройки очереди.

## Troubleshooting

### Очередь не работает

1. Проверить переменные окружения
2. Проверить права доступа сервисного аккаунта
3. Проверить логи: `type: 'queue_not_configured'` или `type: 'match_notification_queue_failed'`

### Сообщения не обрабатываются

1. Проверить, что consumer запущен (логи при старте бота)
2. Проверить логи обработки: `type: 'message_processing_failed'`
3. Проверить visibility timeout (сообщения должны быть видимы)

### Высокая задержка

1. Увеличить `MaxNumberOfMessages` в consumer (сейчас 10)
2. Уменьшить `WaitTimeSeconds` для более быстрого опроса
3. Запустить несколько consumer инстансов
