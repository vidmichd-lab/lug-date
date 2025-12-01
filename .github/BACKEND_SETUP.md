# Настройка автоматического деплоя Backend

## ✅ Что уже сделано

1. ✅ Создан GitHub Actions workflow (`.github/workflows/deploy-backend.yml`)
2. ✅ Настроен serverless handler для Express (`backend/src/handler.ts`)
3. ✅ Установлен `serverless-http` для работы в Cloud Functions
4. ✅ Backend экспортирует app для serverless режима

## 📋 Что нужно сделать

### Шаг 1: Добавить секреты в GitHub

Перейдите в: https://github.com/vidmichd-lab/lug-date/settings/secrets/actions

Добавьте следующие секреты:

#### Обязательные секреты:

1. **YC_SERVICE_ACCOUNT_KEY**
   - JSON ключ сервисного аккаунта Yandex Cloud
   - Нужен для работы с Yandex Cloud CLI

#### Для Development (ветка develop):

2. **YDB_ENDPOINT_DEV** - например: `grpcs://ydb.serverless.yandexcloud.net:2135`
3. **YDB_DATABASE_DEV** - путь к базе данных, например: `/ru-central1/b1g.../etn...`
4. **YDB_TOKEN_DEV** (опционально) - токен доступа
5. **TELEGRAM_BOT_TOKEN_DEV** - токен вашего Telegram бота
6. **YANDEX_STORAGE_BUCKET_DEV** - имя бакета Object Storage
7. **YANDEX_STORAGE_ACCESS_KEY_DEV** - Access Key
8. **YANDEX_STORAGE_SECRET_KEY_DEV** - Secret Key

#### Для Production (ветка main):

9. **YDB_ENDPOINT_PROD** - endpoint для production
10. **YDB_DATABASE_PROD** - база данных для production
11. **YDB_TOKEN_PROD** (опционально)
12. **TELEGRAM_BOT_TOKEN_PROD** - токен бота для production
13. **YANDEX_STORAGE_BUCKET_PROD** - бакет для production
14. **YANDEX_STORAGE_ACCESS_KEY_PROD** - Access Key
15. **YANDEX_STORAGE_SECRET_KEY_PROD** - Secret Key

#### Для алертов:

16. **TELEGRAM_ALERT_BOT_TOKEN** - токен бота для отправки алертов
17. **TELEGRAM_ALERT_CHAT_ID** - ID чата для алертов

### Шаг 2: Создать функции в Yandex Cloud (опционально)

Функции создадутся автоматически при первом деплое, но можно создать вручную:

```bash
# Получите folder-id
yc resource-manager folder list

# Создайте функции (замените <folder-id> на ваш)
yc serverless function create \
  --name dating-app-backend-staging \
  --description "Dating app backend API (staging)" \
  --folder-id <folder-id>

yc serverless function create \
  --name dating-app-backend-prod \
  --description "Dating app backend API (production)" \
  --folder-id <folder-id>
```

**Или добавьте `YC_FOLDER_ID` в GitHub Secrets** - тогда функции создадутся автоматически при деплое.

### Шаг 3: Запустить деплой

После добавления всех секретов:

1. **Сделайте push в develop:**
   ```bash
   git push origin develop
   ```

2. **Или запустите вручную:**
   - Перейдите в GitHub → Actions
   - Выберите workflow "Deploy Backend to Yandex Cloud Functions"
   - Нажмите "Run workflow"

### Шаг 4: Получить URL backend

После успешного деплоя:

1. В логах GitHub Actions будет URL функции
2. Или получите через CLI:
   ```bash
   yc serverless function get --name dating-app-backend-staging --format json | jq -r '.http_invoke_url'
   ```

### Шаг 5: Обновить конфигурацию frontend и admin

После получения URL backend:

1. **Для админки:**
   - Обновите `admin/public/config.js`:
     ```javascript
     window.ADMIN_CONFIG = {
       API_URL: 'https://functions.yandexcloud.net/<your-function-id>'
     };
     ```
   - Или задеплойте с переменной:
     ```bash
     BACKEND_URL=https://functions.yandexcloud.net/<your-function-id> npm run deploy:admin
     ```

2. **Для frontend:**
   - Добавьте в `.env`:
     ```env
     VITE_API_URL=https://functions.yandexcloud.net/<your-function-id>
     ```

## 🔍 Проверка работы

После деплоя проверьте:

```bash
# Health check
curl https://functions.yandexcloud.net/<function-id>/health

# Должен вернуть: {"status":"ok","service":"backend"}
```

## 📝 Логи

Просмотр логов:

```bash
# Логи staging
yc serverless function logs --name dating-app-backend-staging

# Логи production
yc serverless function logs --name dating-app-backend-prod
```

## ⚠️ Важно

- Backend работает автоматически, не требует локального запуска
- Миграции запускаются при каждом деплое
- Все секреты хранятся в GitHub Secrets, не в коде
- CORS настроен для работы с frontend и admin

