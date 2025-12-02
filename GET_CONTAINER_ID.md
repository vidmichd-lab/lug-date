# Как получить YC_CONTAINER_ID_PROD

## Быстрый способ

### 1. Если у вас настроен Yandex Cloud CLI:

```bash
# Получить ID контейнера production
yc serverless container get \
  --name=lug-date-backend-prod \
  --folder-id=$(yc config get folder-id) \
  --format json | jq -r '.id'
```

### 2. Через веб-консоль:

1. Откройте https://console.cloud.yandex.ru/
2. Перейдите в **Serverless Containers**
3. Найдите контейнер `lug-date-backend-prod`
4. ID будет в URL или в информации о контейнере
5. Формат: `bb1234567890abcdef` (начинается с `bb`)

### 3. Из логов GitHub Actions:

1. Откройте последний успешный деплой в production
2. Найдите шаг "Deploy Backend" или "Get Backend URL"
3. В логах будет виден ID контейнера

## Что делать дальше

1. Скопируйте полученный ID
2. Откройте GitHub → Settings → Secrets and variables → Actions
3. Добавьте новый secret:
   - **Name**: `YC_CONTAINER_ID_PROD`
   - **Value**: `<скопированный_id>` (например: `bb1234567890abcdef`)

## Альтернатива (без Container ID)

Если не хотите указывать Container ID, убедитесь что настроен:

- `YC_FOLDER_ID` - ID каталога (обязательно)

Workflow будет использовать имя контейнера `lug-date-backend-prod` + `YC_FOLDER_ID`.

## Проверка

После добавления secret, следующий деплой должен:

1. Использовать Container ID для быстрого доступа
2. Правильно получить BACKEND_URL
3. Обновить config.js в админке
