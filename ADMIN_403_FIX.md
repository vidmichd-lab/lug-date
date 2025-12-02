# Исправление ошибки 403 в админке

## Проблема

Админка выдает ошибку 403 Forbidden при попытке загрузить события или другие данные.

## Причины

Ошибка 403 означает, что бекенд отклоняет запрос. Возможные причины:

1. **Неправильно настроен ADMIN_ORIGINS_PROD**
   - URL админки не указан в списке разрешенных origin'ов
   - CORS блокирует запрос

2. **Неправильный origin в запросе**
   - Браузер отправляет origin, который не совпадает с настройками

3. **Проблемы с CORS preflight (OPTIONS)**
   - OPTIONS запрос не обрабатывается правильно

## Решение

### 1. Проверить URL админки

Узнайте точный URL вашей админки:

- Обычно это: `https://<bucket-name>.website.yandexcloud.net`
- Например: `https://lug-admin-deploy-prod.website.yandexcloud.net`

### 2. Обновить ADMIN_ORIGINS_PROD в GitHub Secrets

1. Откройте GitHub → Settings → Secrets and variables → Actions
2. Найдите `ADMIN_ORIGINS_PROD`
3. Убедитесь, что там указан правильный URL админки

**Формат:**

```
https://lug-admin-deploy-prod.website.yandexcloud.net
```

**Если несколько админок:**

```
https://lug-admin-deploy-prod.website.yandexcloud.net,https://admin.yourdomain.com
```

### 3. Также проверьте ALLOWED_ORIGINS_PROD

Убедитесь, что `ALLOWED_ORIGINS_PROD` также содержит URL админки:

```
https://lug-admin-deploy-prod.website.yandexcloud.net,https://yourdomain.com
```

### 4. Передеплойте бекенд

После обновления секретов, передеплойте бекенд:

```bash
git commit --allow-empty -m "force deploy all"
git push origin main
```

## Проверка в браузере

1. Откройте админку в браузере
2. Откройте DevTools → Network
3. Попробуйте загрузить события
4. Проверьте запрос:
   - **Request Headers** → `Origin`: должен совпадать с URL админки
   - **Response Headers** → `Access-Control-Allow-Origin`: должен содержать ваш origin
   - **Status**: если 403, проверьте CORS настройки

## Проверка CORS на бекенде

Бекенд проверяет origin в следующем порядке:

1. `ALLOWED_ORIGINS` - общие разрешенные origin'ы
2. `ADMIN_ORIGINS` - специально для админки
3. Дефолтные админские origin'ы (включая `lug-admin-deploy.website.yandexcloud.net`)

Если ваш URL не входит ни в один из этих списков, запрос будет отклонен с 403.

## Быстрая проверка

```bash
# 1. Получить URL бекенда
BACKEND_URL=$(yc serverless container get --id="<YC_CONTAINER_ID_PROD>" --format json | jq -r '.url')

# 2. Проверить CORS для админки
curl -H "Origin: https://lug-admin-deploy-prod.website.yandexcloud.net" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     "${BACKEND_URL}/api/admin/management/events" \
     -v
```

Должен вернуть:

- `Access-Control-Allow-Origin: https://lug-admin-deploy-prod.website.yandexcloud.net`
- Status 200

## Если проблема не решается

1. Проверьте логи бекенда в Yandex Cloud Console
2. Убедитесь, что переменные окружения правильно установлены
3. Проверьте, что бекенд перезапустился после обновления секретов
