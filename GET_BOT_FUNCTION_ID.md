# Как получить YC_BOT_FUNCTION_ID

## Что это

`YC_BOT_FUNCTION_ID` - это ID функции бота в Yandex Cloud Functions. Используется для деплоя бота.

## Как получить

### Способ 1: Через Yandex Cloud CLI

```bash
# Список всех функций в каталоге
yc serverless function list --folder-id=<ваш_folder_id> --format json | jq -r '.[] | "\(.name): \(.id)"'

# Получить ID функции по имени
yc serverless function get \
  --name=<имя_функции> \
  --folder-id=<ваш_folder_id> \
  --format json | jq -r '.id'
```

### Способ 2: Через веб-консоль

1. Откройте https://console.cloud.yandex.ru/
2. Перейдите в **Serverless Functions**
3. Найдите вашу функцию бота
4. ID будет виден в URL или в информации о функции
5. Формат ID: `d4e...` (начинается с `d4e`)

### Способ 3: После создания функции

Если функция еще не создана, создайте её:

```bash
yc serverless function create \
  --name=lug-date-bot-prod \
  --folder-id=<ваш_folder_id> \
  --format json | jq -r '.id'
```

## Что делать дальше

1. Скопируйте полученный ID
2. Откройте GitHub → Settings → Secrets and variables → Actions
3. Добавьте новый secret:
   - **Name**: `YC_BOT_FUNCTION_ID_PROD` (для production)
   - **Name**: `YC_BOT_FUNCTION_ID_STAGING` (для staging)
   - **Value**: `<скопированный_id>` (например: `d4enks8erf8eentnojj9`)

## Важно

- Если `YC_BOT_FUNCTION_ID_PROD` не указан, деплой бота будет пропущен с предупреждением
- Это не критично - остальные компоненты задеплоятся нормально
- Бот можно задеплоить позже, когда функция будет создана

## Проверка

После добавления secret, следующий деплой должен:

1. Найти функцию по ID
2. Задеплоить бота успешно
3. Установить переменные окружения (NODE_ENV, TELEGRAM_BOT_TOKEN)
