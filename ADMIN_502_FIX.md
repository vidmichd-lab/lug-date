# Исправление ошибки 502 в админке

## Проблема

Админка выдает ошибку 502 при попытке подключиться к бекенду.

## Причины

1. **Неправильный BACKEND_URL в config.js**
   - В `admin/public/config.js` указан URL функции (`functions.yandexcloud.net`), а не контейнера
   - Это значит, что `BACKEND_URL` не получился правильно в workflow

2. **YC_CONTAINER_ID_PROD не настроен**
   - В GitHub Secrets должен быть настроен `YC_CONTAINER_ID_PROD`
   - Или `YC_FOLDER_ID` для получения URL контейнера по имени

3. **Бекенд не задеплоился**
   - Проверить логи деплоя в GitHub Actions
   - Убедиться, что шаг "Deploy Backend" выполнился успешно

## Решение

### 1. Проверить GitHub Secrets

Убедитесь, что в GitHub Secrets настроены:

- `YC_CONTAINER_ID_PROD` - ID контейнера backend в Yandex Cloud
- ИЛИ `YC_FOLDER_ID` - ID папки для поиска контейнера по имени

### 2. Проверить логи деплоя

1. Откройте GitHub Actions: https://github.com/vidmichd-lab/lug-date/actions
2. Найдите последний успешный деплой в production
3. Проверьте шаг "Get Backend URL for Admin Config"
4. Убедитесь, что `BACKEND_URL` получен правильно

### 3. Передеплоить админку

Если `BACKEND_URL` не получился, нужно:

1. Убедиться, что секреты настроены правильно
2. Запустить деплой снова:

```bash
git commit --allow-empty -m "force deploy all"
git push origin main
```

### 4. Проверить бекенд

Убедитесь, что бекенд работает:

```bash
# Получить URL бекенда
yc serverless container get --id="<YC_CONTAINER_ID_PROD>" --format json | jq -r '.url'

# Проверить health
curl https://<backend-url>/health
```

### 5. Проверить CORS

Убедитесь, что в GitHub Secrets настроены:

- `ALLOWED_ORIGINS_PROD` - список разрешенных origin'ов
- `ADMIN_ORIGINS_PROD` - список разрешенных origin'ов для админки

Пример:

```
ALLOWED_ORIGINS_PROD=https://yourdomain.com,https://www.yourdomain.com
ADMIN_ORIGINS_PROD=https://admin.yourdomain.com,https://lug-admin-deploy-prod.website.yandexcloud.net
```

## Быстрое исправление

Если нужно быстро исправить, можно вручную обновить `config.js`:

1. Получить URL бекенда:

```bash
yc serverless container get --id="<YC_CONTAINER_ID_PROD>" --format json | jq -r '.url'
```

2. Обновить `admin/public/config.js`:

```javascript
window.ADMIN_CONFIG = window.ADMIN_CONFIG || {
  API_URL: 'https://<полученный-url-контейнера>',
};
```

3. Пересобрать и задеплоить админку:

```bash
npm run build:admin
npm run deploy:admin
```

Но лучше исправить проблему в workflow, чтобы это не повторялось.
