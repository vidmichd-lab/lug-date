# Настройка Sentry

## Шаг 1: Создание проекта на sentry.io

1. Перейдите на [sentry.io](https://sentry.io) и создайте аккаунт (бесплатно)
2. Создайте новый проект:
   - Выберите **React** для frontend
   - Выберите **Node.js** для backend
3. Скопируйте DSN (Data Source Name) для каждого проекта

## Шаг 2: Настройка Frontend

1. Добавьте в `.env`:
```bash
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

2. Sentry автоматически инициализируется при запуске приложения

3. Для тестирования в development:
```bash
VITE_SENTRY_ENABLE_DEV=true
```

## Шаг 3: Настройка Backend

1. Добавьте в `.env`:
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

2. Sentry автоматически инициализируется при запуске сервера

3. Для тестирования в development:
```bash
SENTRY_ENABLE_DEV=true
```

## Шаг 4: Настройка Release Tracking

Добавьте версию приложения для отслеживания релизов:

```bash
# Frontend
VITE_APP_VERSION=1.0.0

# Backend
APP_VERSION=1.0.0
```

## Шаг 5: Настройка алертов в Sentry

1. Перейдите в **Settings → Alerts** в вашем проекте Sentry
2. Создайте правило:
   - **Trigger**: When an issue is seen more than X times
   - **Action**: Send notification to Telegram/Email

## Тестирование

### Frontend
```typescript
// В любом компоненте
throw new Error('Test error for Sentry');
```

### Backend
```typescript
// В любом route
throw new Error('Test error for Sentry');
```

Ошибки автоматически отправятся в Sentry.

## Полезные ссылки

- [Sentry Documentation](https://docs.sentry.io/)
- [React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Node.js Integration](https://docs.sentry.io/platforms/node/)

