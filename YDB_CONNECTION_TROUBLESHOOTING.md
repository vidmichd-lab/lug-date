# Диагностика проблемы подключения к YDB

## Текущая ситуация

✅ **Что работает:**

- `YDB_ENDPOINT_DEV` установлен: `grpcs://ydb.serverless.yandexcloud.net:2135`
- `YDB_DATABASE_DEV` установлен: `/ru-central1/b1g6a1tnrohoeas9v0k6/etn8n7ptmkui9808eo6b`
- `YC_SERVICE_ACCOUNT_KEY_FILE` установлен: `./yc-service-account-key.json`
- Файл сервисного аккаунта существует и валиден
- Credentials загружаются успешно

❌ **Проблема:**

- YDB driver initialization timeout (30 секунд)
- Подключение не устанавливается

## Возможные причины

### 1. Сетевые проблемы

- Firewall блокирует подключение к порту 2135
- Нужен VPN для доступа к Yandex Cloud
- Проблемы с DNS

### 2. Неправильный endpoint

- Endpoint может быть другим для вашего региона
- Проверьте в консоли Yandex Cloud правильный endpoint

### 3. Проблемы с сервисным аккаунтом

- Недостаточно прав у сервисного аккаунта
- Сервисный аккаунт не имеет доступа к YDB

## Решения

### Решение 1: Проверьте endpoint в Yandex Cloud Console

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в YDB
3. Выберите вашу базу данных
4. Скопируйте правильный endpoint (может отличаться от стандартного)

### Решение 2: Проверьте права сервисного аккаунта

Убедитесь, что сервисный аккаунт имеет роль:

- `ydb.editor` или `ydb.admin` для работы с базой данных

### Решение 3: Используйте токен вместо сервисного аккаунта

В `.env` добавьте:

```bash
YDB_TOKEN_DEV=ваш-токен-здесь
```

Токен можно получить через:

```bash
yc iam create-token
```

### Решение 4: Проверьте сетевую доступность

Попробуйте подключиться вручную:

```bash
# Установите YDB CLI если еще не установлен
# Затем попробуйте:
ydb -e grpcs://ydb.serverless.yandexcloud.net:2135 \
    -d /ru-central1/b1g6a1tnrohoeas9v0k6/etn8n7ptmkui9808eo6b \
    scheme ls
```

## Текущая конфигурация в .env

```bash
YDB_ENDPOINT_DEV=grpcs://ydb.serverless.yandexcloud.net:2135
YDB_DATABASE_DEV=/ru-central1/b1g6a1tnrohoeas9v0k6/etn8n7ptmkui9808eo6b
YC_SERVICE_ACCOUNT_KEY_FILE=./yc-service-account-key.json
```

## Следующие шаги

1. Проверьте endpoint в Yandex Cloud Console
2. Проверьте права сервисного аккаунта
3. Попробуйте использовать токен вместо сервисного аккаунта
4. Проверьте сетевую доступность (firewall, VPN)

## Логи для диагностики

Запустите с максимальным логированием:

```bash
LOG_LEVEL=debug npm run migrate
```

Обратите внимание на:

- `ydb_credentials_loaded` - credentials загружены успешно
- `ydb_driver_creating` - драйвер создается
- `ydb_driver_timeout` - timeout подключения
