# Настройка GitHub Secrets для деплоя

## ⚠️ КРИТИЧЕСКИ ВАЖНО: Безопасность

**ВНИМАНИЕ:** Если вы видите это предупреждение, значит в этом файле ранее были обнаружены реальные секретные ключи Yandex Cloud, которые были скомпрометированы.

**НЕОБХОДИМО НЕМЕДЛЕННО:**

1. Отозвать все старые ключи доступа в Yandex Cloud Console
2. Создать новые ключи доступа
3. Обновить их в GitHub Secrets
4. НЕ коммитить реальные ключи в репозиторий

## 📋 Какие секреты нужно добавить

### Для Frontend деплоя:

1. Перейдите в GitHub → Settings → Secrets and variables → Actions
2. Добавьте следующие секреты:

#### Для Development (ветка develop):

- `FRONTEND_STORAGE_BUCKET_DEV` = `telegram-app-frontend`
- `FRONTEND_STORAGE_ACCESS_KEY_DEV` = `<ваш_access_key_id>` (получите в Yandex Cloud Console)
- `FRONTEND_STORAGE_SECRET_KEY_DEV` = `<ваш_secret_access_key>` (получите в Yandex Cloud Console)

#### Для Production (ветка main):

- `FRONTEND_STORAGE_BUCKET_PROD` = `telegram-app-frontend` (или отдельный)
- `FRONTEND_STORAGE_ACCESS_KEY_PROD` = `<ваш_access_key_id>` (получите в Yandex Cloud Console)
- `FRONTEND_STORAGE_SECRET_KEY_PROD` = `<ваш_secret_access_key>` (получите в Yandex Cloud Console)

### Для Admin деплоя:

#### Для Development (ветка develop):

- `ADMIN_STORAGE_BUCKET_DEV` = `lug-admin-deploy`
- `ADMIN_STORAGE_ACCESS_KEY_DEV` = `<ваш_access_key_id>` (получите в Yandex Cloud Console)
- `ADMIN_STORAGE_SECRET_KEY_DEV` = `<ваш_secret_access_key>` (получите в Yandex Cloud Console)

#### Для Production (ветка main):

- `ADMIN_STORAGE_BUCKET_PROD` = `lug-admin-deploy-prod` (или отдельный bucket)
- `ADMIN_STORAGE_ACCESS_KEY_PROD` = (создайте отдельный ключ для production)
- `ADMIN_STORAGE_SECRET_KEY_PROD` = (создайте отдельный ключ для production)

### Для Backend деплоя (Production):

#### Критически важные секреты для CORS и безопасности:

- `ALLOWED_ORIGINS_PROD` = Список разрешенных origin'ов через запятую (например: `https://yourdomain.com,https://www.yourdomain.com`)
- `ADMIN_ORIGINS_PROD` = Список разрешенных origin'ов для admin панели (например: `https://admin.yourdomain.com`)

#### Секреты для авторизации админки (опционально):

- `ADMIN_USERNAME_PROD` = Имя пользователя для входа в админку (по умолчанию: `admin`)
- `ADMIN_PASSWORD_PROD` = Пароль для входа в админку (по умолчанию: `admin123`)
- `ADMIN_TOKEN_PROD` = Токен для авторизации запросов (по умолчанию: `admin-secret-token-change-in-production`)

**⚠️ ВАЖНО:** Обязательно измените значения по умолчанию в production!

#### Другие необходимые секреты для Production:

- `YC_CONTAINER_ID_PROD` = ID контейнера backend в Yandex Cloud
- `YC_BOT_FUNCTION_ID_PROD` = ID функции бота в Yandex Cloud (опционально, если не указан - деплой бота будет пропущен)
  - **Текущий ID:** `d4ejmsp9tfulgbo0apn8` (dating-app-bot-prod)
- `TELEGRAM_BOT_TOKEN_PROD` = Токен Telegram бота для production
- `YDB_ENDPOINT_PROD` = Endpoint базы данных YDB для production
- `YDB_DATABASE_PROD` = Имя базы данных YDB для production
- `YANDEX_STORAGE_BUCKET_PROD` = Имя bucket в Yandex Object Storage для production
- `YANDEX_STORAGE_ACCESS_KEY_PROD` = Access key для Yandex Object Storage (production)
- `YANDEX_STORAGE_SECRET_KEY_PROD` = Secret key для Yandex Object Storage (production)

## ⚠️ Важно: Безопасность секретов

**НИКОГДА не коммитьте реальные секретные ключи в репозиторий!**

Если GitHub Secret Scanning обнаружил секреты:

1. Немедленно отзовите скомпрометированные ключи в Yandex Cloud Console
2. Создайте новые ключи
3. Обновите их в GitHub Secrets
4. Удалите секреты из истории Git (используйте `git filter-branch` или `BFG Repo-Cleaner`)

**GitHub Secret Scanning блокирует push с секретами - это правильное поведение для защиты ваших данных.**

## ✅ После настройки

- GitHub Actions будет автоматически деплоить frontend при push в develop/main
- Секреты будут использоваться только в CI/CD, не будут в коде
- Push protection больше не будет блокировать (после разрешения)
