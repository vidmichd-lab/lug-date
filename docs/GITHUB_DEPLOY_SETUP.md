# Полная настройка GitHub Deploy

Подробная инструкция по настройке автоматического деплоя через GitHub Actions.

## 📋 Список всех необходимых Secrets

### 🔴 Обязательные (для работы деплоя)

#### 1. YC_SERVICE_ACCOUNT_KEY

**Описание:** JSON ключ сервисного аккаунта Yandex Cloud  
**Где взять:** Yandex Cloud Console → IAM → Service accounts → Create JSON key  
**Формат:** Полный JSON объект (весь файл целиком)

#### 2. TELEGRAM_BOT_TOKEN_DEV

**Описание:** Токен Telegram бота для staging  
**Где взять:** @BotFather в Telegram  
**Пример:** `<ваш_bot_token>` (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

**⚠️ ВАЖНО:** НЕ используйте реальные токены в примерах! Получите токен в @BotFather.

#### 3. TELEGRAM_BOT_TOKEN_PROD

**Описание:** Токен Telegram бота для production  
**Где взять:** @BotFather в Telegram  
**Пример:** `<ваш_bot_token>` (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

**⚠️ ВАЖНО:** НЕ используйте реальные токены в примерах! Получите токен в @BotFather.

#### 4. YDB_ENDPOINT_DEV

**Описание:** Endpoint YDB базы данных для staging  
**Пример:** `grpcs://ydb.serverless.yandexcloud.net:2135`

#### 5. YDB_DATABASE_DEV

**Описание:** Путь к базе данных YDB для staging  
**Пример:** `/ru-central1/b1g6a1tnrohoeas9v0k6/etn8n7ptmkui9808eo6b`

#### 6. YDB_TOKEN_DEV (опционально)

**Описание:** Токен для доступа к YDB (staging)  
**Где взять:** Из service account key или IAM токен  
**Примечание:** Не обязателен, если используется YC_SERVICE_ACCOUNT_KEY. SDK автоматически использует credentials из service account key.

#### 7. YDB_ENDPOINT_PROD

**Описание:** Endpoint YDB базы данных для production  
**Пример:** `grpcs://ydb.serverless.yandexcloud.net:2135`

#### 8. YDB_DATABASE_PROD

**Описание:** Путь к базе данных YDB для production  
**Пример:** `/ru-central1/b1g6a1tnrohoeas9v0k6/etn8n7ptmkui9808eo6b`

#### 9. YDB_TOKEN_PROD (опционально)

**Описание:** Токен для доступа к YDB (production)  
**Где взять:** Из service account key или IAM токен  
**Примечание:** Не обязателен, если используется YC_SERVICE_ACCOUNT_KEY. SDK автоматически использует credentials из service account key.

#### 10. YANDEX_STORAGE_BUCKET_DEV

**Описание:** Имя бакета Object Storage для staging  
**Пример:** `dating-app-storage`

#### 11. YANDEX_STORAGE_ACCESS_KEY_DEV

**Описание:** Access Key для Object Storage (staging)  
**Где взять:** Yandex Cloud Console → Object Storage → Service accounts

#### 12. YANDEX_STORAGE_SECRET_KEY_DEV

**Описание:** Secret Key для Object Storage (staging)  
**Где взять:** Yandex Cloud Console → Object Storage → Service accounts

#### 13. YANDEX_STORAGE_BUCKET_PROD

**Описание:** Имя бакета Object Storage для production  
**Пример:** `dating-app-storage-prod`

#### 14. YANDEX_STORAGE_ACCESS_KEY_PROD

**Описание:** Access Key для Object Storage (production)  
**Где взять:** Yandex Cloud Console → Object Storage → Service accounts

#### 15. YANDEX_STORAGE_SECRET_KEY_PROD

**Описание:** Secret Key для Object Storage (production)  
**Где взять:** Yandex Cloud Console → Object Storage → Service accounts

### 🟡 Опциональные (для дополнительных функций)

#### 16. TELEGRAM_ALERT_BOT_TOKEN

**Описание:** Токен бота для отправки алертов  
**Где взять:** @BotFather в Telegram  
**Пример:** `<ваш_alert_bot_token>` (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

**⚠️ ВАЖНО:** НЕ используйте реальные токены в примерах! Получите токен в @BotFather.

#### 17. TELEGRAM_ALERT_CHAT_ID

**Описание:** Chat ID для отправки алертов  
**Где взять:** @userinfobot в Telegram  
**Пример:** `319315134`

## 🚀 Пошаговая настройка

### Шаг 1: Откройте страницу Secrets

Перейдите: **https://github.com/vidmichd-lab/lug-date/settings/secrets/actions**

Или:

1. Откройте репозиторий: https://github.com/vidmichd-lab/lug-date
2. Settings → Secrets and variables → Actions

### Шаг 2: Создайте все Secrets

Нажмите **New repository secret** для каждого секрета и заполните:

#### Обязательные секреты:

1. **YC_SERVICE_ACCOUNT_KEY**
   - Name: `YC_SERVICE_ACCOUNT_KEY`
   - Secret: Весь JSON файл сервисного аккаунта

2. **TELEGRAM_BOT_TOKEN_DEV**
   - Name: `TELEGRAM_BOT_TOKEN_DEV`
   - Secret: Токен бота для staging

3. **TELEGRAM_BOT_TOKEN_PROD**
   - Name: `TELEGRAM_BOT_TOKEN_PROD`
   - Secret: Токен бота для production

4. **YDB_ENDPOINT_DEV**
   - Name: `YDB_ENDPOINT_DEV`
   - Secret: `grpcs://ydb.serverless.yandexcloud.net:2135`

5. **YDB_DATABASE_DEV**
   - Name: `YDB_DATABASE_DEV`
   - Secret: Ваш путь к базе данных

6. **YDB_TOKEN_DEV** (опционально)
   - Name: `YDB_TOKEN_DEV`
   - Secret: Токен доступа к YDB
   - **Примечание:** Можно пропустить, если используется YC_SERVICE_ACCOUNT_KEY

7. **YDB_ENDPOINT_PROD**
   - Name: `YDB_ENDPOINT_PROD`
   - Secret: `grpcs://ydb.serverless.yandexcloud.net:2135`

8. **YDB_DATABASE_PROD**
   - Name: `YDB_DATABASE_PROD`
   - Secret: Ваш путь к базе данных

9. **YDB_TOKEN_PROD** (опционально)
   - Name: `YDB_TOKEN_PROD`
   - Secret: Токен доступа к YDB
   - **Примечание:** Можно пропустить, если используется YC_SERVICE_ACCOUNT_KEY

10. **YANDEX_STORAGE_BUCKET_DEV**
    - Name: `YANDEX_STORAGE_BUCKET_DEV`
    - Secret: Имя бакета для staging

11. **YANDEX_STORAGE_ACCESS_KEY_DEV**
    - Name: `YANDEX_STORAGE_ACCESS_KEY_DEV`
    - Secret: Access Key для Object Storage

12. **YANDEX_STORAGE_SECRET_KEY_DEV**
    - Name: `YANDEX_STORAGE_SECRET_KEY_DEV`
    - Secret: Secret Key для Object Storage

13. **YANDEX_STORAGE_BUCKET_PROD**
    - Name: `YANDEX_STORAGE_BUCKET_PROD`
    - Secret: Имя бакета для production

14. **YANDEX_STORAGE_ACCESS_KEY_PROD**
    - Name: `YANDEX_STORAGE_ACCESS_KEY_PROD`
    - Secret: Access Key для Object Storage

15. **YANDEX_STORAGE_SECRET_KEY_PROD**
    - Name: `YANDEX_STORAGE_SECRET_KEY_PROD`
    - Secret: Secret Key для Object Storage

#### Опциональные секреты:

16. **TELEGRAM_ALERT_BOT_TOKEN**
    - Name: `TELEGRAM_ALERT_BOT_TOKEN`
    - Secret: Токен бота для алертов

17. **TELEGRAM_ALERT_CHAT_ID**
    - Name: `TELEGRAM_ALERT_CHAT_ID`
    - Secret: Chat ID для алертов

### Шаг 3: Создайте Environments

Перейдите: **https://github.com/vidmichd-lab/lug-date/settings/environments**

#### Создайте "staging":

1. Нажмите **New environment**
2. Имя: `staging`
3. Нажмите **Configure environment**
4. Environment URL: `https://staging-api.yourdomain.com` (опционально)
5. Нажмите **Save environment**

#### Создайте "production":

1. Нажмите **New environment**
2. Имя: `production`
3. Нажмите **Configure environment**
4. Environment URL: `https://api.yourdomain.com` (опционально)
5. Deployment branches: Выберите "Selected branches" → добавьте `main`
6. Нажмите **Save environment**

## ✅ Проверка настройки

### Чеклист Secrets

Откройте: https://github.com/vidmichd-lab/lug-date/settings/secrets/actions

Должны быть видны все 17 секретов (или минимум 15 обязательных).

### Чеклист Environments

Откройте: https://github.com/vidmichd-lab/lug-date/settings/environments

Должны быть видны:

- ✅ `staging`
- ✅ `production`

## 🧪 Тестирование деплоя

### Тест Staging

1. Переключитесь на ветку `develop`:

   ```bash
   git checkout develop
   ```

2. Создайте тестовый коммит:

   ```bash
   git commit --allow-empty -m "test: проверка деплоя staging"
   git push origin develop
   ```

3. Проверьте GitHub Actions:
   - Откройте: https://github.com/vidmichd-lab/lug-date/actions
   - Должен запуститься workflow "Deploy to Yandex Cloud"
   - Проверьте, что все шаги выполнены успешно

### Тест Production

⚠️ **Внимание:** Production деплой запускается только из ветки `main`!

1. Переключитесь на ветку `main`:

   ```bash
   git checkout main
   ```

2. Создайте тестовый коммит:

   ```bash
   git commit --allow-empty -m "test: проверка деплоя production"
   git push origin main
   ```

3. Проверьте GitHub Actions:
   - Откройте: https://github.com/vidmichd-lab/lug-date/actions
   - Должен запуститься workflow "Deploy to Yandex Cloud"
   - Проверьте, что все шаги выполнены успешно

## 🔍 Быстрая проверка через скрипт

Используйте скрипт для проверки настройки:

```bash
npm run check:github-setup
```

Скрипт проверит:

- Наличие всех необходимых secrets
- Наличие environments
- Корректность имен

## 🐛 Решение проблем

### Ошибка: "Secret not found"

**Решение:**

1. Проверьте имя секрета (должно точно совпадать)
2. Убедитесь, что секрет создан на уровне репозитория
3. Проверьте, что вы в правильном репозитории

### Ошибка: "Environment not found"

**Решение:**

1. Проверьте имена environments в workflow
2. Убедитесь, что environments созданы
3. Проверьте права доступа

### Ошибка: "Invalid JSON credentials"

**Решение:**

1. Проверьте формат JSON (jsonlint.com)
2. Убедитесь, что скопирован весь файл
3. Проверьте наличие всех полей

### Ошибка: "Deployment failed"

**Решение:**

1. Проверьте логи в GitHub Actions
2. Убедитесь, что все secrets заполнены
3. Проверьте права сервисного аккаунта в Yandex Cloud

## 📝 Дополнительная информация

### Структура деплоя

- **Staging:** Автоматически деплоится при push в `develop`
- **Production:** Автоматически деплоится при push в `main`
- **Tests:** Запускаются перед каждым деплоем

### Безопасность

- ✅ Все secrets зашифрованы GitHub
- ✅ Значения никогда не показываются в логах
- ✅ Production защищен (только main ветка)
- ✅ Environments могут иметь дополнительные ограничения

## 🔗 Полезные ссылки

- [GitHub Actions](https://github.com/vidmichd-lab/lug-date/actions)
- [GitHub Secrets](https://github.com/vidmichd-lab/lug-date/settings/secrets/actions)
- [GitHub Environments](https://github.com/vidmichd-lab/lug-date/settings/environments)
- [Yandex Cloud Console](https://console.cloud.yandex.ru)

---

**Последнее обновление:** 2024-12-01
