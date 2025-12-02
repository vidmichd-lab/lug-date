# Как найти ID каталога и контейнера в Yandex Cloud

## 1. YC_FOLDER_ID (ID каталога) - ОБЯЗАТЕЛЬНО

### Способ 1: Через веб-консоль Yandex Cloud

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Войдите в свой аккаунт
3. В левом верхнем углу выберите каталог (folder)
4. ID каталога будет виден в URL или в настройках каталога
5. Формат ID: `b1g...` (начинается с `b1g`)

### Способ 2: Через Yandex Cloud CLI

```bash
# Список всех каталогов
yc resource-manager folder list

# Получить ID текущего каталога
yc config get folder-id

# Или получить ID конкретного каталога по имени
yc resource-manager folder get --name=<имя_каталога> --format json | jq -r '.id'
```

### Способ 3: Через API

```bash
# Если у вас настроен yc CLI
yc resource-manager folder list --format json | jq -r '.[].id'
```

## 2. YC_CONTAINER_ID (ID контейнера) - ОПЦИОНАЛЬНО

### Способ 1: После создания контейнера через CLI

```bash
# Создать контейнер и получить его ID
yc serverless container create \
  --name=lug-date-backend-staging \
  --folder-id=<ваш_folder_id> \
  --format json | jq -r '.id'
```

### Способ 2: Получить ID существующего контейнера

```bash
# По имени контейнера с folder-id
yc serverless container get \
  --name=lug-date-backend-staging \
  --folder-id=<ваш_folder_id> \
  --format json | jq -r '.id'

# Список всех контейнеров в каталоге
yc serverless container list \
  --folder-id=<ваш_folder_id> \
  --format json | jq -r '.[].id'
```

### Способ 3: Через веб-консоль

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в раздел **Serverless Containers**
3. Выберите ваш контейнер
4. ID будет виден в URL или в информации о контейнере
5. Формат ID: `bb...` (начинается с `bb`)

## 3. Как добавить в GitHub Secrets

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Добавьте каждый secret:
   - **Name**: `YC_FOLDER_ID`
   - **Value**: `<ваш_folder_id>` (например: `b1g1234567890abcdef`)
   - **Name**: `YC_CONTAINER_ID_STAGING` (опционально)
   - **Value**: `<container_id>` (например: `bb1234567890abcdef`)
   - **Name**: `YC_CONTAINER_ID_PROD` (опционально)
   - **Value**: `<container_id>` (например: `bb1234567890abcdef`)

## 4. Быстрая проверка

После настройки secrets, проверьте что все работает:

```bash
# Проверить folder-id
yc config get folder-id

# Проверить контейнеры
yc serverless container list --folder-id=$(yc config get folder-id)
```

## 5. Автоматическое получение Container ID после первого деплоя

После первого успешного деплоя, Container ID будет выведен в логах GitHub Actions. Вы можете скопировать его и добавить в Secrets для ускорения последующих деплоев.

## Примечания

- **YC_FOLDER_ID** обязателен для работы workflow
- **YC_CONTAINER_ID** опционален, но ускоряет деплой (не нужно искать контейнер по имени)
- Если Container ID не указан, workflow будет использовать `--container-name` с `--folder-id`
- ID каталога обычно начинается с `b1g`
- ID контейнера обычно начинается с `bb`
