# Backend Docker Deploy для Yandex Cloud Functions

## Проблема

Для пакетов > 3.5 MB в Yandex Cloud Functions нужно использовать Docker образ вместо ZIP архива.

## Решение

Используем Docker образ, загруженный в Yandex Container Registry.

## Настройка

### 1. Создание Container Registry

```bash
# Создать registry
yc container registry create --name dating-app-registry

# Получить ID registry
yc container registry list
```

### 2. Настройка GitHub Secrets

Добавьте в GitHub Secrets:

- `CR_REGISTRY_ID` - ID вашего Container Registry (например, `crp1234567890abcdef`)

Или используйте переменную окружения в workflow (по умолчанию используется значение из secrets).

### 3. Структура деплоя

1. **Сборка Docker образа** - собирается из корня проекта с использованием `backend/Dockerfile`
2. **Загрузка в Container Registry** - образ загружается с тегами:
   - `staging-<commit-sha>` или `prod-<commit-sha>` - для конкретного коммита
   - `staging-latest` или `prod-latest` - последняя версия
3. **Создание версии функции** - используется `--runtime container` и `--image` вместо `--source-path`

## Dockerfile

Dockerfile находится в `backend/Dockerfile` и оптимизирован для serverless:
- Multi-stage build для минимального размера
- Только production зависимости
- Правильная структура для handler.handler

## Команды деплоя

### Staging

```bash
yc serverless function version create \
  --function-name dating-app-backend-staging \
  --runtime container \
  --entrypoint "handler.handler" \
  --memory 128m \
  --execution-timeout 10s \
  --image "cr.yandex/<registry-id>/dating-app-backend:staging-latest" \
  --environment "NODE_ENV=development,..."
```

### Production

```bash
yc serverless function version create \
  --function-name dating-app-backend-prod \
  --runtime container \
  --entrypoint "handler.handler" \
  --memory 256m \
  --execution-timeout 30s \
  --image "cr.yandex/<registry-id>/dating-app-backend:prod-latest" \
  --environment "NODE_ENV=production,..."
```

## Локальная сборка и тестирование

```bash
# Сборка образа
docker build -f backend/Dockerfile -t dating-app-backend:local .

# Тестирование образа
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e YDB_ENDPOINT=... \
  dating-app-backend:local
```

## Отличия от ZIP деплоя

1. **Runtime**: `container` вместо `nodejs18`
2. **Entrypoint**: `handler.handler` вместо `index.handler`
3. **Источник**: `--image` вместо `--source-path`
4. **Размер**: нет ограничения 3.5 MB

## Troubleshooting

### Ошибка аутентификации в Container Registry

```bash
# Получить IAM token
yc iam create-token | docker login --username iam --password-stdin cr.yandex
```

### Проверка образа в registry

```bash
# Список образов
yc container image list --registry-id <registry-id>

# Информация об образе
yc container image get <image-id>
```

### Проверка логов функции

```bash
yc serverless function logs dating-app-backend-staging --limit 50
```

