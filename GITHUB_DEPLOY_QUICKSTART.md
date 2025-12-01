# GitHub Deploy - Быстрый старт

## 🚀 Быстрая настройка (5 минут)

### 1. Откройте страницу Secrets

**https://github.com/vidmichd-lab/lug-date/settings/secrets/actions**

### 2. Добавьте обязательные Secrets

Нажмите **New repository secret** для каждого:

#### Минимум для работы:

1. **YC_SERVICE_ACCOUNT_KEY** - JSON ключ сервисного аккаунта Yandex Cloud
2. **TELEGRAM_BOT_TOKEN_DEV** - Токен бота для staging
3. **TELEGRAM_BOT_TOKEN_PROD** - Токен бота для production
4. **YDB_ENDPOINT_DEV** - `grpcs://ydb.serverless.yandexcloud.net:2135` (без кавычек)
5. **YDB_DATABASE_DEV** - Путь к вашей базе данных
6. **YDB_ENDPOINT_PROD** - `grpcs://ydb.serverless.yandexcloud.net:2135` (без кавычек)
7. **YDB_DATABASE_PROD** - Путь к вашей базе данных
8. **YANDEX_STORAGE_BUCKET_DEV** - Имя бакета Object Storage
9. **YANDEX_STORAGE_ACCESS_KEY_DEV** - Access Key
10. **YANDEX_STORAGE_SECRET_KEY_DEV** - Secret Key
11. **YANDEX_STORAGE_BUCKET_PROD** - Имя бакета Object Storage
12. **YANDEX_STORAGE_ACCESS_KEY_PROD** - Access Key
13. **YANDEX_STORAGE_SECRET_KEY_PROD** - Secret Key

#### Опционально (если не используете YC_SERVICE_ACCOUNT_KEY для YDB):

6. **YDB_TOKEN_DEV** - Токен доступа к YDB (опционально, если есть YC_SERVICE_ACCOUNT_KEY)
9. **YDB_TOKEN_PROD** - Токен доступа к YDB (опционально, если есть YC_SERVICE_ACCOUNT_KEY)
#### Опционально (для алертов):

14. **TELEGRAM_ALERT_BOT_TOKEN** - Токен бота для алертов
15. **TELEGRAM_ALERT_CHAT_ID** - Chat ID для алертов

### 3. Создайте Environments

**https://github.com/vidmichd-lab/lug-date/settings/environments**

1. Нажмите **New environment**
2. Имя: `staging` → Save
3. Нажмите **New environment**
4. Имя: `production` → Save

### 4. Проверьте настройку

```bash
npm run check:github-setup
```

## ✅ Готово!

Теперь при push в:
- `develop` → автоматический деплой в **staging**
- `main` → автоматический деплой в **production**

## 💡 Важно

- **YDB_TOKEN_DEV** и **YDB_TOKEN_PROD** теперь **опциональны**!
- Если у вас есть **YC_SERVICE_ACCOUNT_KEY**, SDK автоматически использует его для доступа к YDB
- Токены нужны только если вы не используете service account key

## 📖 Подробная инструкция

См. [docs/GITHUB_DEPLOY_SETUP.md](docs/GITHUB_DEPLOY_SETUP.md)

