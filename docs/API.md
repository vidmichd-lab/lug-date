# API Documentation

Полная документация API для Telegram Dating App.

## Базовый URL

- **Development**: `http://localhost:4000`
- **Staging**: `https://staging-api.yourdomain.com`
- **Production**: `https://api.yourdomain.com`

## Аутентификация

Все запросы (кроме `/health`) требуют аутентификации через Telegram `initData`.

### Headers

```http
Authorization: Bearer <telegram-init-data>
Content-Type: application/json
```

## Формат ответа

### Успешный ответ

```json
{
  "success": true,
  "data": {
    // Данные ответа
  }
}
```

### Ошибка

```json
{
  "success": false,
  "error": {
    "message": "Описание ошибки",
    "code": "ERROR_CODE"
  }
}
```

## Endpoints

### Health Check

Проверка работоспособности сервиса.

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "backend"
}
```

---

## Admin API

### Общая статистика

Получить общую статистику приложения.

```http
GET /api/admin/analytics/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "newThisWeek": 87,
      "growth": 12.5
    },
    "events": {
      "active": 45,
      "past": 120,
      "total": 165
    },
    "matches": {
      "total": 342,
      "today": 12,
      "thisWeek": 89,
      "growth": 8.3
    },
    "conversionRate": {
      "likesToMatches": 15.2,
      "viewsToLikes": 8.5,
      "viewsToMatches": 1.3
    },
    "onlineUsers": 156
  }
}
```

### График регистраций пользователей

```http
GET /api/admin/analytics/users-chart?period=7d
```

**Query Parameters:**
- `period` (optional): `7d` | `30d` (default: `7d`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "registrations": 15,
      "active": 45
    }
  ]
}
```

### Топ событий

```http
GET /api/admin/analytics/events-top?limit=10
```

**Query Parameters:**
- `limit` (optional): количество событий (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "title": "Событие 1",
      "likes": 450,
      "views": 2000,
      "matches": 45
    }
  ]
}
```

### Воронка конверсии

```http
GET /api/admin/analytics/funnel
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "stage": "Просмотры",
      "count": 10000,
      "percentage": 100
    },
    {
      "stage": "Лайки",
      "count": 850,
      "percentage": 8.5
    },
    {
      "stage": "Матчи",
      "count": 130,
      "percentage": 1.3
    }
  ]
}
```

### Heatmap активности

```http
GET /api/admin/analytics/activity-heatmap
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "day": "Пн",
      "hour": 0,
      "value": 45
    }
  ]
}
```

### Последние матчи

```http
GET /api/admin/analytics/recent-matches?limit=10
```

**Query Parameters:**
- `limit` (optional): количество матчей (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "match-1",
      "user1": {
        "id": "user-1",
        "name": "Пользователь 1"
      },
      "user2": {
        "id": "user-2",
        "name": "Пользователь 2"
      },
      "eventId": "event-1",
      "eventTitle": "Событие 1",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## Matches API

### Создать матч

```http
POST /api/v1/matches
```

**Request Body:**
```json
{
  "userId1": "user-123",
  "userId2": "user-456",
  "eventId": "event-789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "match-123",
    "userId1": "user-123",
    "userId2": "user-456",
    "eventId": "event-789",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Получить матчи

```http
GET /api/v1/matches
```

**Query Parameters:**
- `userId` (optional): фильтр по пользователю
- `eventId` (optional): фильтр по событию
- `limit` (optional): количество результатов (default: 20)
- `offset` (optional): смещение (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "match-123",
      "userId1": "user-123",
      "userId2": "user-456",
      "eventId": "event-789",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Photos API

### Загрузить фото

```http
POST /api/v1/photos
Content-Type: multipart/form-data
```

**Form Data:**
- `photo` (file): изображение (max 10MB)
- `userId` (string): ID пользователя

**Response:**
```json
{
  "success": true,
  "data": {
    "photoUrls": {
      "thumbnail": {
        "webp": "https://cdn.example.com/photos/user-123/thumbnail.webp",
        "jpeg": "https://cdn.example.com/photos/user-123/thumbnail.jpg"
      },
      "medium": {
        "webp": "https://cdn.example.com/photos/user-123/medium.webp",
        "jpeg": "https://cdn.example.com/photos/user-123/medium.jpg"
      },
      "full": {
        "webp": "https://cdn.example.com/photos/user-123/full.webp",
        "jpeg": "https://cdn.example.com/photos/user-123/full.jpg"
      },
      "blurDataUrl": "data:image/webp;base64,..."
    },
    "uploadedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Ошибки:**
- `400`: Неверные параметры (отсутствует userId или photo)
- `413`: Файл слишком большой (> 10MB)
- `415`: Неподдерживаемый формат файла
- `500`: Ошибка при обработке изображения

---

## Коды ошибок

### HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Неверные параметры запроса |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 409 | Конфликт (например, дубликат) |
| 413 | Файл слишком большой |
| 415 | Неподдерживаемый формат |
| 429 | Слишком много запросов |
| 500 | Внутренняя ошибка сервера |
| 503 | Сервис недоступен |

### Error Codes

| Код | Описание |
|-----|----------|
| `VALIDATION_ERROR` | Ошибка валидации данных |
| `UNAUTHORIZED` | Требуется аутентификация |
| `FORBIDDEN` | Доступ запрещен |
| `NOT_FOUND` | Ресурс не найден |
| `DUPLICATE_ENTRY` | Дубликат записи |
| `FILE_TOO_LARGE` | Файл слишком большой |
| `UNSUPPORTED_FORMAT` | Неподдерживаемый формат |
| `DATABASE_ERROR` | Ошибка базы данных |
| `EXTERNAL_SERVICE_ERROR` | Ошибка внешнего сервиса |
| `INTERNAL_ERROR` | Внутренняя ошибка |

## Rate Limiting

API имеет ограничения на количество запросов:

- **Общие endpoints**: 100 запросов в минуту
- **Загрузка файлов**: 10 запросов в минуту
- **Admin endpoints**: 200 запросов в минуту

При превышении лимита возвращается статус `429 Too Many Requests`.

## Примеры использования

### cURL

**Создать матч:**
```bash
curl -X POST http://localhost:4000/api/v1/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId1": "user-123",
    "userId2": "user-456",
    "eventId": "event-789"
  }'
```

**Загрузить фото:**
```bash
curl -X POST http://localhost:4000/api/v1/photos \
  -H "Authorization: Bearer <token>" \
  -F "photo=@/path/to/image.jpg" \
  -F "userId=user-123"
```

### JavaScript (Fetch)

```javascript
// Создать матч
const response = await fetch('http://localhost:4000/api/v1/matches', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    userId1: 'user-123',
    userId2: 'user-456',
    eventId: 'event-789'
  })
});

const data = await response.json();
```

### React Query

```typescript
import { useMutation } from '@tanstack/react-query';

const createMatch = async (matchData: {
  userId1: string;
  userId2: string;
  eventId?: string;
}) => {
  const response = await fetch('/api/v1/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(matchData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create match');
  }
  
  return response.json();
};

// Использование
const { mutate } = useMutation({
  mutationFn: createMatch,
  onSuccess: (data) => {
    console.log('Match created:', data);
  },
});
```

## Версионирование

API использует версионирование через URL:
- `/api/v1/` - текущая версия
- `/api/v2/` - будущая версия (при необходимости)

Старые версии поддерживаются в течение 6 месяцев после релиза новой версии.

## Changelog

### v1.0.0 (2024-01-01)
- Первый релиз API
- Endpoints для матчей и фото
- Admin analytics endpoints

