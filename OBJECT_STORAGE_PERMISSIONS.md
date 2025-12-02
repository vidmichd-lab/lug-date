# Настройка прав доступа к Object Storage для деплоя бекенда

## Проблема

При загрузке архива в Object Storage возникает ошибка:

```
AccessDenied: Access Denied
```

## Решение

Service Account должен иметь права на запись в Object Storage bucket.

## Настройка прав

### Вариант 1: Через Yandex Cloud Console

1. Откройте [Yandex Cloud Console](https://console.yandex.cloud/)
2. Перейдите в **Object Storage** → выберите ваш bucket
3. Перейдите на вкладку **Access**
4. Добавьте Service Account с ролью **Storage Uploader** или **Storage Editor**

### Вариант 2: Через Yandex Cloud CLI

```bash
# Получить ID Service Account
SERVICE_ACCOUNT_ID="aje0defcl8b2577p01hg"

# Получить ID bucket
BUCKET_NAME="your-bucket-name"  # Замените на ваш bucket

# Назначить роль Storage Uploader для Service Account на bucket
yc storage bucket update \
  --name $BUCKET_NAME \
  --grant service-account-id=$SERVICE_ACCOUNT_ID:storage.uploader
```

Или для всей папки (folder):

```bash
FOLDER_ID="b1g6rst3sps7hhu8tqla"
SERVICE_ACCOUNT_ID="aje0defcl8b2577p01hg"

# Назначить роль Storage Uploader для Service Account на папку
yc resource-manager folder add-access-binding $FOLDER_ID \
  --role storage.uploader \
  --subject serviceAccount:$SERVICE_ACCOUNT_ID
```

### Вариант 3: Через Terraform (если используется)

```hcl
resource "yandex_storage_bucket" "backend_deploy" {
  bucket = "your-bucket-name"

  grant {
    type        = "ServiceAccount"
    id          = "aje0defcl8b2577p01hg"
    permissions = ["WRITE", "READ"]
  }
}
```

## Проверка прав

```bash
# Проверить права Service Account на bucket
yc storage bucket get --name your-bucket-name

# Или проверить через IAM
yc iam service-account get --id aje0defcl8b2577p01hg
```

## Необходимые роли

Для загрузки архива в Object Storage Service Account должен иметь одну из ролей:

- **`storage.uploader`** - минимальные права для загрузки файлов
- **`storage.editor`** - полные права на редактирование (включая удаление)
- **`storage.admin`** - полные права администратора

## Текущий Service Account

- **ID**: `aje0defcl8b2577p01hg`
- **Используется для**: деплоя функций и работы с Object Storage

## После настройки прав

1. Запустите workflow заново
2. Проверьте, что архив успешно загружается
3. Убедитесь, что функция деплоится с использованием URL из Object Storage

## Дополнительная информация

- [Документация Yandex Cloud: Права доступа к Object Storage](https://cloud.yandex.ru/docs/storage/security/)
- [Документация Yandex Cloud: Роли для Object Storage](https://cloud.yandex.ru/docs/storage/security/roles/)
