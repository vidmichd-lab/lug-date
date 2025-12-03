# Очистка после удаления Staging окружения

## 🔴 GitHub Secrets - Удалить следующие секреты

### Backend секреты (staging):

- `TELEGRAM_BOT_TOKEN_DEV`
- `YDB_ENDPOINT_DEV`
- `YDB_DATABASE_DEV`
- `YDB_TOKEN_DEV` (если есть)
- `YANDEX_STORAGE_BUCKET_DEV`
- `YANDEX_STORAGE_ACCESS_KEY_DEV`
- `YANDEX_STORAGE_SECRET_KEY_DEV`
- `YC_CONTAINER_ID_STAGING`
- `ADMIN_USERNAME_DEV`
- `ADMIN_PASSWORD_DEV`
- `ADMIN_TOKEN_DEV`
- `ALLOWED_ORIGINS_DEV`
- `ADMIN_ORIGINS_DEV`

### Frontend секреты (staging):

- `FRONTEND_STORAGE_BUCKET_DEV`
- `FRONTEND_STORAGE_ACCESS_KEY_DEV`
- `FRONTEND_STORAGE_SECRET_KEY_DEV`

### Admin секреты (staging):

- `ADMIN_STORAGE_BUCKET_DEV`
- `ADMIN_STORAGE_ACCESS_KEY_DEV`
- `ADMIN_STORAGE_SECRET_KEY_DEV`

### Bot секреты (staging):

- `YC_BOT_FUNCTION_ID_STAGING`

### Production секреты (если есть отдельные \_PROD):

⚠️ **ВНИМАНИЕ**: Если у вас есть секреты с суффиксом `_PROD`, их нужно **переименовать** в обычные имена (без суффикса), а не удалять!

Например:

- `TELEGRAM_BOT_TOKEN_PROD` → переименовать в `TELEGRAM_BOT_TOKEN`
- `YDB_ENDPOINT_PROD` → переименовать в `YDB_ENDPOINT`
- `ADMIN_ORIGINS_PROD` → переименовать в `ADMIN_ORIGINS`
- и т.д.

## ✅ GitHub Secrets - Оставить (используются в production)

### Общие секреты:

- `YC_SERVICE_ACCOUNT_KEY`
- `YC_CLOUD_ID` (опционально)
- `YC_FOLDER_ID` (опционально)
- `YC_REGISTRY_ID`
- `YC_SERVICE_ACCOUNT_ID`
- `YC_CONTAINER_ID` (или использовать YC_FOLDER_ID)
- `TELEGRAM_ALERT_BOT_TOKEN`
- `TELEGRAM_ALERT_CHAT_ID`

### Backend секреты (production):

- `TELEGRAM_BOT_TOKEN` (без суффикса)
- `YDB_ENDPOINT` (без суффикса)
- `YDB_DATABASE` (без суффикса)
- `YANDEX_STORAGE_BUCKET` (без суффикса)
- `YANDEX_STORAGE_ACCESS_KEY` (без суффикса)
- `YANDEX_STORAGE_SECRET_KEY` (без суффикса)
- `ADMIN_USERNAME` (без суффикса)
- `ADMIN_PASSWORD` (без суффикса)
- `ADMIN_TOKEN` (без суффикса)
- `ALLOWED_ORIGINS` (без суффикса)
- `ADMIN_ORIGINS` (без суффикса)

### Frontend секреты (production):

- `FRONTEND_STORAGE_BUCKET` (без суффикса)
- `FRONTEND_STORAGE_ACCESS_KEY` (без суффикса)
- `FRONTEND_STORAGE_SECRET_KEY` (без суффикса)

### Admin секреты (production):

- `ADMIN_STORAGE_BUCKET` (без суффикса)
- `ADMIN_STORAGE_ACCESS_KEY` (без суффикса)
- `ADMIN_STORAGE_SECRET_KEY` (без суффикса)

### Bot секреты (production):

- `YC_BOT_FUNCTION_ID` (без суффикса)

## 🗑️ Yandex Cloud - Ресурсы для удаления

### 1. Serverless Containers (staging):

```bash
# Найти staging контейнеры
yc serverless container list --folder-id=<YOUR_FOLDER_ID>

# Удалить staging контейнер (если есть)
yc serverless container delete --name=lug-date-backend-staging --folder-id=<YOUR_FOLDER_ID>
# или по ID
yc serverless container delete --id=<CONTAINER_ID>
```

### 2. Serverless Functions (staging):

```bash
# Найти staging функции
yc serverless function list --folder-id=<YOUR_FOLDER_ID>

# Удалить staging функцию бота (если есть)
yc serverless function delete --name=lug-date-bot-staging --folder-id=<YOUR_FOLDER_ID>
# или по ID
yc serverless function delete --id=<FUNCTION_ID>
```

### 3. Object Storage Buckets (staging):

```bash
# Список бакетов
yc storage bucket list

# Удалить staging бакеты (⚠️ ВНИМАНИЕ: это удалит все данные!)
# Frontend staging bucket
yc storage bucket delete --name=<frontend-staging-bucket-name>

# Admin staging bucket
yc storage bucket delete --name=<admin-staging-bucket-name>

# Backend storage staging bucket (если есть отдельный)
yc storage bucket delete --name=<backend-storage-staging-bucket-name>
```

### 4. Container Registry Images (staging теги):

```bash
# Список образов
yc container image list --registry-id=<YOUR_REGISTRY_ID>

# Удалить старые staging образы (опционально, для экономии места)
# Обычно можно оставить, они не занимают много места
```

### 5. YDB Databases (staging):

⚠️ **ОСТОРОЖНО**: Если у вас есть отдельная staging база данных YDB, решите, нужна ли она вам.

```bash
# Список баз данных
yc ydb database list --folder-id=<YOUR_FOLDER_ID>

# Удалить staging базу (⚠️ ВНИМАНИЕ: это удалит все данные!)
# Обычно staging и production используют одну базу или разные пути в одной базе
# Если staging база отдельная и не нужна:
yc ydb database delete --name=<staging-database-name> --folder-id=<YOUR_FOLDER_ID>
```

## 📋 Пошаговая инструкция очистки

### Шаг 1: Проверка перед удалением

1. **Убедитесь, что production работает:**

   ```bash
   # Проверьте production контейнер
   yc serverless container get --name=lug-date-backend --folder-id=<YOUR_FOLDER_ID>

   # Проверьте health endpoint
   curl https://<your-production-container-url>/health
   ```

2. **Сделайте backup важных данных** (если нужно):
   - Экспорт данных из staging базы (если отдельная)
   - Сохранение конфигураций

### Шаг 2: Удаление GitHub Secrets

1. Откройте: https://github.com/vidmichd-lab/lug-date/settings/secrets/actions
2. Удалите все секреты из списка выше (с `_DEV` и `_STAGING`)
3. Переименуйте `_PROD` секреты в обычные имена (если есть)

### Шаг 3: Удаление Yandex Cloud ресурсов

Выполните команды выше для удаления:

1. Staging контейнеры
2. Staging функции
3. Staging бакеты (⚠️ после проверки, что они не используются)

### Шаг 4: Проверка после очистки

1. **Проверьте, что production деплой работает:**

   ```bash
   # Запустите workflow вручную или сделайте push
   git commit --allow-empty -m "test: проверка после очистки staging"
   git push origin develop
   ```

2. **Проверьте логи:**
   - GitHub Actions workflow должен пройти успешно
   - Production контейнер должен работать

## ⚠️ Важные замечания

1. **Не удаляйте production ресурсы!** Убедитесь, что удаляете только staging ресурсы
2. **Сделайте backup** перед удалением баз данных и бакетов
3. **Проверьте billing** - удаление неиспользуемых ресурсов сэкономит деньги
4. **Environment в GitHub**: Можно удалить environment `staging` в настройках репозитория (Settings → Environments)

## 🔍 Как проверить, что все чисто

```bash
# Проверить контейнеры
yc serverless container list --folder-id=<YOUR_FOLDER_ID>
# Должен быть только: lug-date-backend (без -staging и -prod)

# Проверить функции
yc serverless function list --folder-id=<YOUR_FOLDER_ID>
# Должна быть только production функция бота (если есть)

# Проверить бакеты
yc storage bucket list
# Должны быть только production бакеты (без -dev, -staging)
```

## 📝 После очистки

После удаления всех staging ресурсов:

- ✅ Упростится управление секретами
- ✅ Снизится стоимость (меньше ресурсов)
- ✅ Упростится процесс деплоя (один environment)
- ✅ Меньше путаницы между staging и production
