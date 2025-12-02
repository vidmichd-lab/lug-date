# Настройка YDB подключения

## Текущий статус

✅ `YDB_ENDPOINT_DEV` - установлен  
✅ `YDB_DATABASE_DEV` - установлен  
✅ `yc-service-account-key.json` - файл существует  
❌ `YDB_TOKEN_DEV` - не установлен (не критично, если используется сервисный аккаунт)  
❌ `YC_SERVICE_ACCOUNT_KEY_FILE` - не установлен

## Решение

У вас есть два варианта:

### Вариант 1: Использовать сервисный аккаунт (рекомендуется)

Добавьте в `.env` файл:

```bash
# Путь к файлу сервисного аккаунта (относительно корня проекта)
YC_SERVICE_ACCOUNT_KEY_FILE=./yc-service-account-key.json
```

Или если хотите использовать переменную с содержимым JSON:

```bash
# Содержимое JSON ключа (в одну строку, без переносов)
YC_SERVICE_ACCOUNT_KEY={"service_account_id":"...","key_id":"...","private_key":"..."}
```

### Вариант 2: Использовать токен

Добавьте в `.env` файл:

```bash
YDB_TOKEN_DEV=ваш-токен-здесь
```

## Проверка настройки

После добавления переменной в `.env`, проверьте:

```bash
# Проверить переменные
node -e "require('dotenv').config(); console.log('YC_SERVICE_ACCOUNT_KEY_FILE:', process.env.YC_SERVICE_ACCOUNT_KEY_FILE || 'NOT SET');"

# Запустить миграции
npm run migrate
```

## Примечание

YDB SDK автоматически ищет учетные данные в следующем порядке:
1. `YDB_TOKEN` - токен доступа
2. `YC_SERVICE_ACCOUNT_KEY_FILE` - путь к файлу с ключом
3. `YC_SERVICE_ACCOUNT_KEY` - JSON ключ как строка
4. Metadata service (при запуске в Yandex Cloud)

Если у вас есть файл `yc-service-account-key.json`, просто добавьте `YC_SERVICE_ACCOUNT_KEY_FILE=./yc-service-account-key.json` в `.env`.



