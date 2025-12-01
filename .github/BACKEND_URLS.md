# URL Backend функций

## Staging (Development)

**Function ID:** `d4er75rsvc5mopabt70v`  
**URL:** `https://functions.yandexcloud.net/d4er75rsvc5mopabt70v`

Используется для ветки `develop`.

## Production

**Function ID:** `d4ecebdokiksrq5fkl9b`  
**URL:** `https://functions.yandexcloud.net/d4ecebdokiksrq5fkl9b`

Используется для ветки `main`.

## Использование

### Для админки:

```bash
BACKEND_URL=https://functions.yandexcloud.net/d4er75rsvc5mopabt70v npm run deploy:admin
```

### Для frontend:

Добавьте в `.env`:
```env
VITE_API_URL=https://functions.yandexcloud.net/d4er75rsvc5mopabt70v
```

## Проверка

```bash
# Health check staging
curl https://functions.yandexcloud.net/d4er75rsvc5mopabt70v/health

# Health check production
curl https://functions.yandexcloud.net/d4ecebdokiksrq5fkl9b/health
```

## Логи

```bash
# Staging
yc serverless function logs --name dating-app-backend-staging

# Production
yc serverless function logs --name dating-app-backend-prod
```

