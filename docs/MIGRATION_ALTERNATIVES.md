# Альтернативные способы запуска миграций базы данных

Если миграции не работают через GitHub Actions, используйте один из альтернативных способов:

## 1. Локальный запуск миграций

### Требования:

- Node.js >= 20
- Файл `yc-service-account-key.json` в корне проекта
- Файл `.env` с переменными окружения

### Шаги:

1. **Создайте файл `.env` в корне проекта:**

```bash
YDB_ENDPOINT=grpcs://ydb.serverless.yandexcloud.net:2135
YDB_DATABASE=/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv
YC_SERVICE_ACCOUNT_KEY_FILE=./yc-service-account-key.json
```

2. **Скачайте ключ Service Account:**
   - Откройте: https://console.cloud.yandex.ru/iam/service-accounts
   - Найдите Service Account: `ajealt724899jtugjv6k`
   - Создайте новый ключ и сохраните как `yc-service-account-key.json`

3. **Запустите миграции:**

```bash
chmod +x scripts/run-migrations-locally.sh
./scripts/run-migrations-locally.sh
```

Или вручную:

```bash
cd backend
npm install
npm run migrate
```

## 2. Проверка подключения к YDB

Перед запуском миграций проверьте подключение:

```bash
chmod +x scripts/check-ydb-connection.sh
./scripts/check-ydb-connection.sh
```

Или вручную:

```bash
cd backend
npm run test:ydb
```

## 3. Создание базы данных через Yandex Cloud Console

Если база данных не существует:

1. **Откройте Yandex Cloud Console:**
   - https://console.cloud.yandex.ru/folders/b1g6rst3sps7hhu8tqla/ydb

2. **Создайте новую базу данных:**
   - Нажмите "Создать базу данных"
   - Выберите тип: **Serverless**
   - Имя: `lug-dating-db`
   - Регион: `ru-central1`

3. **Скопируйте путь к базе данных:**
   - Формат: `/ru-central1/<cloud-id>/<database-id>`
   - Обновите секрет `YDB_DATABASE` в GitHub

4. **Проверьте права Service Account:**
   - Откройте базу данных
   - Перейдите в "Права доступа"
   - Убедитесь, что Service Account `ajealt724899jtugjv6k` имеет роль **YDB Editor**

## 4. Использование Yandex Cloud CLI

### Установка Yandex Cloud CLI:

```bash
# macOS
brew install yandex-cloud-cli

# Linux
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
```

### Авторизация:

```bash
yc init
```

### Проверка базы данных:

```bash
chmod +x scripts/create-ydb-database.sh
./scripts/create-ydb-database.sh
```

### Создание базы данных (если не существует):

```bash
yc ydb database create \
  --name lug-dating-db \
  --folder-id b1g6rst3sps7hhu8tqla \
  --serverless
```

### Получение информации о базе данных:

```bash
yc ydb database get --id etnbi9hemleeobirfbrv --folder-id b1g6rst3sps7hhu8tqla
```

## 5. Создание таблиц вручную через Query Editor

Если миграции не работают, можно создать таблицы вручную:

1. **Откройте Query Editor в Yandex Cloud Console:**
   - https://console.cloud.yandex.ru/folders/b1g6rst3sps7hhu8tqla/ydb
   - Выберите базу данных
   - Перейдите в "Query Editor"

2. **Создайте таблицу migrations:**

```sql
CREATE TABLE migrations (
  id String NOT NULL,
  name String NOT NULL,
  executed_at Timestamp NOT NULL,
  PRIMARY KEY (id)
);
```

3. **Создайте таблицу migration_lock:**

```sql
CREATE TABLE migration_lock (
  id String NOT NULL,
  locked_at Timestamp NOT NULL,
  locked_by String NOT NULL,
  PRIMARY KEY (id)
);
```

4. **Или используйте скрипт:**

```bash
cd backend
npm run create:tables
```

## 6. Запуск миграций через Yandex Cloud VM

Если локальный запуск не работает из-за сетевых ограничений:

1. **Создайте VM в Yandex Cloud:**
   - https://console.cloud.yandex.ru/folders/b1g6rst3sps7hhu8tqla/compute
   - Выберите Ubuntu 22.04
   - Подключите Service Account с ролью YDB Editor

2. **Подключитесь к VM:**

```bash
ssh ubuntu@<vm-ip>
```

3. **Клонируйте репозиторий:**

```bash
git clone https://github.com/vidmichd-lab/lug-date.git
cd lug-date
```

4. **Настройте переменные окружения:**

```bash
# Создайте .env файл
cat > .env << EOF
YDB_ENDPOINT=grpcs://ydb.serverless.yandexcloud.net:2135
YDB_DATABASE=/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv
EOF
```

5. **Запустите миграции:**

```bash
cd backend
npm install
npm run migrate
```

## 7. Использование YDB CLI

YDB CLI позволяет выполнять SQL запросы напрямую:

### Установка YDB CLI:

```bash
# macOS
brew install ydb

# Linux
curl -sSL https://storage.yandexcloud.net/ydb/install.sh | bash
```

### Подключение к базе данных:

```bash
ydb -e grpcs://ydb.serverless.yandexcloud.net:2135 \
    -d /ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv \
    --sa-key-file yc-service-account-key.json \
    scheme ls
```

### Выполнение SQL запросов:

```bash
ydb -e grpcs://ydb.serverless.yandexcloud.net:2135 \
    -d /ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv \
    --sa-key-file yc-service-account-key.json \
    scripting yql -s "SELECT 1 as test"
```

## 8. Диагностика проблем

### Проверка переменных окружения:

```bash
echo "YDB_ENDPOINT: $YDB_ENDPOINT"
echo "YDB_DATABASE: $YDB_DATABASE"
echo "YC_SERVICE_ACCOUNT_KEY_FILE: $YC_SERVICE_ACCOUNT_KEY_FILE"
```

### Проверка ключа Service Account:

```bash
cat yc-service-account-key.json | jq -r '.service_account_id'
```

Должно быть: `ajealt724899jtugjv6k`

### Проверка прав Service Account:

```bash
yc iam service-account get --id ajealt724899jtugjv6k
```

### Проверка подключения через curl:

```bash
# Проверка доступности endpoint
curl -v grpcs://ydb.serverless.yandexcloud.net:2135
```

## Рекомендуемый порядок действий

1. ✅ Проверьте подключение: `./scripts/check-ydb-connection.sh`
2. ✅ Проверьте существование базы данных: `./scripts/create-ydb-database.sh`
3. ✅ Создайте таблицы migrations вручную: `cd backend && npm run create:tables`
4. ✅ Запустите миграции локально: `./scripts/run-migrations-locally.sh`
5. ✅ Если локально не работает, используйте Yandex Cloud VM
6. ✅ После успешного запуска, обновите секреты в GitHub Actions

## Полезные ссылки

- Yandex Cloud Console: https://console.cloud.yandex.ru/
- YDB Documentation: https://cloud.yandex.ru/docs/ydb/
- YDB SDK for Node.js: https://github.com/ydb-platform/ydb-nodejs-sdk
- Yandex Cloud CLI: https://cloud.yandex.ru/docs/cli/
