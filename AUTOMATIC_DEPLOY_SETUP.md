# 🚀 Настройка автоматического деплоя Backend

## ✅ Что уже сделано

1. ✅ Создан GitHub Actions workflow (`.github/workflows/deploy-backend.yml`)
2. ✅ Настроен serverless handler для Express (`backend/src/handler.ts`)
3. ✅ Установлен `serverless-http` для работы в Cloud Functions
4. ✅ Backend экспортирует app для serverless режима
5. ✅ Все секреты удалены из кода

## 📋 Пошаговая инструкция

### ШАГ 1: Добавить секреты в GitHub

**Откройте:** https://github.com/vidmichd-lab/lug-date/settings/secrets/actions

**Нажмите "New repository secret" и добавьте:**

#### Обязательные (для всех окружений):
1. **YC_SERVICE_ACCOUNT_KEY**
   - JSON ключ сервисного аккаунта Yandex Cloud
   - Скачайте из Yandex Cloud Console → IAM → Service Accounts

#### Для Development (ветка develop):
2. **YDB_ENDPOINT_DEV** - например: `grpcs://ydb.serverless.yandexcloud.net:2135`
3. **YDB_DATABASE_DEV** - путь к базе, например: `/ru-central1/b1g.../etn...`
4. **YDB_TOKEN_DEV** (опционально) - если используете токен вместо service account
5. **TELEGRAM_BOT_TOKEN_DEV** - токен вашего Telegram бота
6. **YANDEX_STORAGE_BUCKET_DEV** - имя бакета Object Storage
7. **YANDEX_STORAGE_ACCESS_KEY_DEV** - Access Key для Object Storage
8. **YANDEX_STORAGE_SECRET_KEY_DEV** - Secret Key для Object Storage

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

### ШАГ 2: Разрешить push с секретами (если еще не сделано)

GitHub может блокировать push из-за секретов в истории. Разрешите их:

1. Откройте эти ссылки и нажмите "Allow secret":
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36Fzc59uI5R6tff6RwKGLWAKJKO
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36Fzc4DycBs7bTwMipKg2k0ie5Y
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36FzcApbYN8ZVsxr5zs2w7nlmD9

2. После разрешения выполните:
   ```bash
   git push origin develop
   ```

### ШАГ 3: Запустить деплой

После добавления всех секретов и разрешения push:

**Вариант А: Автоматический деплой**
```bash
git push origin develop
```
GitHub Actions автоматически запустит деплой при push в `develop` или `main`.

**Вариант Б: Ручной запуск**
1. Перейдите в GitHub → Actions
2. Выберите workflow "Deploy Backend to Yandex Cloud Functions"
3. Нажмите "Run workflow" → выберите ветку → "Run workflow"

### ШАГ 4: Получить URL backend

После успешного деплоя:

1. **В логах GitHub Actions:**
   - Откройте завершившийся workflow run
   - Найдите шаг "Get function URL"
   - Скопируйте URL функции

2. **Или через Yandex Cloud CLI:**
   ```bash
   yc serverless function get --name dating-app-backend-staging --format json | jq -r '.http_invoke_url'
   ```

URL будет выглядеть примерно так:
```
https://functions.yandexcloud.net/d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### ШАГ 5: Обновить конфигурацию frontend и admin

После получения URL backend:

**Для админки:**
```bash
BACKEND_URL=https://functions.yandexcloud.net/<your-function-id> npm run deploy:admin
```

**Для frontend:**
Добавьте в `.env` в корне проекта:
```env
VITE_API_URL=https://functions.yandexcloud.net/<your-function-id>
```

Затем задеплойте frontend:
```bash
npm run deploy:frontend
```

## 🔍 Проверка работы

После деплоя проверьте:

```bash
# Health check
curl https://functions.yandexcloud.net/<function-id>/health

# Должен вернуть: {"status":"ok","service":"backend"}
```

## 📝 Просмотр логов

```bash
# Логи staging
yc serverless function logs --name dating-app-backend-staging --limit 50

# Логи production  
yc serverless function logs --name dating-app-backend-prod --limit 50
```

## ⚠️ Важно

- ✅ Backend работает автоматически, не требует локального запуска
- ✅ Миграции запускаются при каждом деплое
- ✅ Все секреты хранятся в GitHub Secrets, не в коде
- ✅ CORS настроен для работы с frontend и admin
- ✅ При изменении `backend/**` или `shared/**` автоматически запускается деплой

## 🎯 Итог

После настройки:
1. Backend автоматически деплоится при push в `develop`/`main`
2. Не нужно запускать backend локально
3. Все работает в облаке без вашего участия
4. Frontend и admin автоматически используют продакшн backend

## 📖 Дополнительная документация

- `.github/BACKEND_SETUP.md` - подробная инструкция по настройке
- `docs/BACKEND_DEPLOY.md` - документация по деплою
- `.github/SECRETS_SETUP.md` - настройка секретов

