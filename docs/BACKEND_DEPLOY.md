# Автоматический деплой Backend в Yandex Cloud Functions

Backend автоматически деплоится в Yandex Cloud Functions при push в ветки `main` или `develop`.

## 🚀 Как это работает

1. **При push в `develop` или `main`:**
   - GitHub Actions автоматически запускает workflow
   - Собирает backend и shared пакеты
   - Запускает миграции базы данных
   - Деплоит в Cloud Functions

2. **Backend доступен по URL:**
   - Staging: `https://functions.yandexcloud.net/<function-id>`
   - Production: `https://functions.yandexcloud.net/<function-id>`

## 📋 Требуемые GitHub Secrets

Добавьте следующие секреты в GitHub → Settings → Secrets and variables → Actions:

### Общие секреты:
- `YC_SERVICE_ACCOUNT_KEY` - JSON ключ сервисного аккаунта Yandex Cloud

### Для Development (ветка develop):
- `YDB_ENDPOINT_DEV` - Endpoint YDB для development
- `YDB_DATABASE_DEV` - Имя базы данных YDB для development
- `YDB_TOKEN_DEV` - Токен доступа к YDB (опционально)
- `TELEGRAM_BOT_TOKEN_DEV` - Токен Telegram бота для development
- `YANDEX_STORAGE_BUCKET_DEV` - Имя бакета Object Storage
- `YANDEX_STORAGE_ACCESS_KEY_DEV` - Access Key для Object Storage
- `YANDEX_STORAGE_SECRET_KEY_DEV` - Secret Key для Object Storage

### Для Production (ветка main):
- `YDB_ENDPOINT_PROD` - Endpoint YDB для production
- `YDB_DATABASE_PROD` - Имя базы данных YDB для production
- `YDB_TOKEN_PROD` - Токен доступа к YDB (опционально)
- `TELEGRAM_BOT_TOKEN_PROD` - Токен Telegram бота для production
- `YANDEX_STORAGE_BUCKET_PROD` - Имя бакета Object Storage
- `YANDEX_STORAGE_ACCESS_KEY_PROD` - Access Key для Object Storage
- `YANDEX_STORAGE_SECRET_KEY_PROD` - Secret Key для Object Storage

### Общие для всех окружений:
- `TELEGRAM_ALERT_BOT_TOKEN` - Токен бота для алертов
- `TELEGRAM_ALERT_CHAT_ID` - ID чата для алертов

## 🔧 Настройка

### 1. Создайте функцию в Yandex Cloud Functions

Функции создаются автоматически при первом деплое, но можно создать вручную:

```bash
yc serverless function create --name dating-app-backend-staging
yc serverless function create --name dating-app-backend-prod
```

### 2. Настройте API Gateway (опционально)

Для более удобного URL можно настроить API Gateway:

```bash
yc serverless api-gateway create --name dating-app-api
```

### 3. Обновите конфигурацию frontend и admin

После деплоя получите URL функции и обновите:
- `admin/public/config.js` - установите `API_URL`
- `frontend/.env` - установите `VITE_API_URL`

## 📝 Проверка деплоя

После деплоя проверьте:

1. **Health check:**
   ```bash
   curl https://functions.yandexcloud.net/<function-id>/health
   ```

2. **Логи:**
   ```bash
   yc serverless function logs --name dating-app-backend-staging
   ```

## ⚠️ Важно

- Backend работает в serverless режиме (не требует постоянного запуска)
- Миграции запускаются автоматически при каждом деплое
- Все переменные окружения передаются через секреты GitHub
- CORS настроен для работы с frontend и admin панелью

## 🔄 Автоматический деплой

Workflow запускается автоматически при:
- Push в ветку `develop` или `main`
- Изменениях в `backend/**` или `shared/**`
- Ручном запуске через GitHub Actions UI



