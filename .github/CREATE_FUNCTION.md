# Создание функции в Yandex Cloud Functions

Функция создастся автоматически при первом деплое через GitHub Actions, но можно создать вручную.

## 🔧 Создание функции вручную

### Шаг 1: Получить Folder ID

```bash
yc resource-manager folder list
```

Скопируйте `ID` нужной папки (folder).

### Шаг 2: Создать функцию

**Для Staging (development):**
```bash
yc serverless function create \
  --name dating-app-backend-staging \
  --description "Dating app backend API (staging)" \
  --folder-id <ваш-folder-id>
```

**Для Production:**
```bash
yc serverless function create \
  --name dating-app-backend-prod \
  --description "Dating app backend API (production)" \
  --folder-id <ваш-folder-id>
```

### Шаг 3: Добавить Folder ID в GitHub Secrets

Добавьте секрет `YC_FOLDER_ID` в GitHub:
- Перейдите: https://github.com/vidmichd-lab/lug-date/settings/secrets/actions
- Нажмите "New repository secret"
- Name: `YC_FOLDER_ID`
- Secret: `<ваш-folder-id>`

## ✅ Альтернатива: Автоматическое создание

Если не создавать функцию вручную, GitHub Actions создаст её автоматически при первом деплое (но может потребоваться folder-id в секретах).

## 🔍 Проверка

После создания проверьте:

```bash
# Список всех функций
yc serverless function list

# Информация о функции
yc serverless function get --name dating-app-backend-staging
```



