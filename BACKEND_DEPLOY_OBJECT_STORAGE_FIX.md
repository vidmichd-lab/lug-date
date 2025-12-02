# Исправление: Деплой бекенда через Object Storage

## Проблема

При деплое бекенда возникала ошибка:

```
ERROR: zip archive content exceeds the maximum size 3.5 MB, use object storage to upload the content
```

Архив функции превышает лимит Yandex Cloud Functions в 3.5 MB.

## Решение

Добавлена загрузка архива в Yandex Object Storage и использование URL из Object Storage для деплоя.

## Изменения в workflow

### 1. Добавлен шаг установки AWS CLI

```yaml
- name: Setup AWS CLI for Object Storage
  run: |
    pip3 install awscli
    # Настройка credentials для доступа к Object Storage
```

### 2. Добавлен шаг загрузки архива в Object Storage

```yaml
- name: Upload archive to Object Storage
  run: |
    # Генерация уникального имени файла
    ARCHIVE_NAME="function-${GITHUB_SHA:0:7}-$(date +%s).zip"
    # Загрузка в Object Storage
    aws --endpoint-url=https://storage.yandexcloud.net s3 cp backend/function.zip s3://${BUCKET}/${ARCHIVE_NAME}
    # Формирование URL для деплоя
    FUNCTION_ARCHIVE_URL="https://storage.yandexcloud.net/${BUCKET}/${ARCHIVE_NAME}"
```

### 3. Изменен шаг деплоя для использования URL из Object Storage

```yaml
yc serverless function version create \
--source-path "$FUNCTION_ARCHIVE_URL" \
# ... остальные параметры
```

## Требования

1. **Service Account** должен иметь права на чтение из Object Storage
2. **Secrets** должны быть настроены:
   - `YANDEX_STORAGE_BUCKET_PROD` / `YANDEX_STORAGE_BUCKET_DEV`
   - `YANDEX_STORAGE_ACCESS_KEY_PROD` / `YANDEX_STORAGE_ACCESS_KEY_DEV`
   - `YANDEX_STORAGE_SECRET_KEY_PROD` / `YANDEX_STORAGE_SECRET_KEY_DEV`

## Формат URL

Yandex Cloud Functions поддерживает URL из Object Storage в формате:

```
https://storage.yandexcloud.net/{bucket}/{key}
```

## Преимущества

- ✅ Нет ограничения на размер архива (кроме лимитов Object Storage)
- ✅ Архивы хранятся в Object Storage с уникальными именами
- ✅ Можно отслеживать историю деплоев по именам архивов
- ✅ Автоматическая очистка старых архивов (опционально)

## Проверка

После деплоя проверьте:

1. **Архив загружен в Object Storage:**

   ```bash
   yc storage ls s3://${BUCKET}/function-*
   ```

2. **Функция задеплоена:**

   ```bash
   yc serverless function get --id d4enks8erf8eentnojj9
   ```

3. **Функция работает:**
   ```bash
   curl https://d5dc4655gjtafu92k0od.yl4tuxdu.apigw.yandexcloud.net/health
   ```

## Дополнительные замечания

- Архивы хранятся с уникальными именами, включающими SHA коммита и timestamp
- Старые архивы можно удалить вручную или настроить автоматическую очистку
- Service Account функции должен иметь права на чтение из Object Storage
