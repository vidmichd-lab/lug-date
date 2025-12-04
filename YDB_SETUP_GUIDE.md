# Руководство по подключению YDB

## Проблема

В логах видна ошибка: `Database not found` для базы данных `/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv`

## Шаги для подключения YDB

### 1. Проверьте, существует ли база данных

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в **Yandex Database (YDB)**
3. Проверьте, существует ли база данных с путем:
   ```
   /ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv
   ```

### 2. Если база данных не существует

**Вариант A: Создать новую базу данных**

1. В Yandex Cloud Console → **Yandex Database (YDB)**
2. Нажмите **Создать базу данных**
3. Выберите:
   - **Serverless режим** (рекомендуется)
   - **Регион**: `ru-central1`
   - **Каталог**: `b1g6a1tnrohoeas9v0k6`
4. После создания скопируйте **путь к базе данных** (например: `/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv`)

**Вариант B: Использовать существующую базу данных**

1. Найдите существующую базу данных в Yandex Cloud Console
2. Скопируйте её путь

### 3. Обновите переменные окружения в контейнере

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в **Serverless Containers** → `lug-date-backend`
3. Откройте **Редактирование**
4. Найдите переменные окружения:
   - `YDB_ENDPOINT`
   - `YDB_DATABASE`
5. Обновите значения:

   **YDB_ENDPOINT:**

   ```
   grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv
   ```

   Или просто:

   ```
   grpcs://ydb.serverless.yandexcloud.net:2135
   ```

   **YDB_DATABASE:**

   ```
   /ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv
   ```

6. Сохраните изменения

### 4. Проверьте права Service Account

1. В Yandex Cloud Console → **Service Accounts**
2. Найдите service account: `lug-date-service-account` (или тот, который указан в `YC_SERVICE_ACCOUNT_ID`)
3. Убедитесь, что у него есть роль:
   - **YDB Editor** или **YDB Admin** (для записи данных)
   - **YDB Viewer** (для чтения данных)

4. Если роли нет:
   - Нажмите на service account
   - Перейдите на вкладку **Роли**
   - Нажмите **Назначить роли**
   - Выберите базу данных YDB
   - Назначьте роль **YDB Editor**

### 5. Проверьте Service Account Key

1. Убедитесь, что в контейнере установлена переменная `YC_SERVICE_ACCOUNT_KEY_B64`
2. Это должен быть base64-encoded JSON ключ service account
3. Ключ должен быть действительным (не истек)

### 6. Проверьте подключение

После обновления переменных окружения:

1. Дождитесь обновления ревизии контейнера (обычно 1-2 минуты)
2. Проверьте логи контейнера:
   - Должны появиться записи `ydb_connection` со статусом `connected`
   - Не должно быть ошибок `Database not found`

3. Проверьте health check:

   ```bash
   curl https://bba2from3lh3r2baegq5.containers.yandexcloud.net/health
   ```

   Должен вернуть:

   ```json
   {
     "status": "ok",
     "service": "backend",
     "database": "connected", // ← должно быть "connected", а не "disconnected"
     "timestamp": "..."
   }
   ```

## Частые проблемы

### Проблема: "Database not found"

**Решение:**

- Проверьте, что база данных существует
- Проверьте правильность пути к базе данных
- Убедитесь, что путь начинается с `/ru-central1/...`

### Проблема: "Permission denied"

**Решение:**

- Проверьте права service account на базу данных
- Убедитесь, что service account имеет роль **YDB Editor**

### Проблема: "Invalid credentials"

**Решение:**

- Проверьте, что `YC_SERVICE_ACCOUNT_KEY_B64` правильно закодирован в base64
- Убедитесь, что ключ не истек
- Проверьте, что ключ соответствует service account

## После успешного подключения

После того, как база данных подключится:

1. Миграции автоматически выполнятся при следующем запросе
2. Таблицы будут созданы автоматически
3. Вы сможете добавлять события через админку

## Проверка через Yandex Cloud CLI

Если у вас установлен `yc` CLI:

```bash
# Проверить список баз данных
yc ydb database list --folder-id b1g6a1tnrohoeas9v0k6

# Проверить права service account
yc resource-manager service-account list-access-bindings ajealt724899jtugjv6k
```
