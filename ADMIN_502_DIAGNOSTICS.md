# Диагностика ошибки 502 в админке

## Проверка 1: Логи последнего деплоя

1. Откройте GitHub Actions: https://github.com/vidmichd-lab/lug-date/actions
2. Найдите последний деплой в production
3. Проверьте шаги:

### Шаг "Get Backend URL for Admin Config"

- ✅ Должен показать: `✅ Got backend URL from container ID: https://...`
- ✅ Должен показать содержимое config.js
- ❌ Если показывает ошибку - проблема в получении URL

### Шаг "Deploy Backend"

- ✅ Должен завершиться успешно
- ❌ Если ошибка - бекенд не задеплоился

### Шаг "Get Backend URL" (после деплоя)

- ✅ Должен показать: `✅ Backend is healthy!`
- ❌ Если показывает ошибки - бекенд не запустился

### Шаг "Deploy Admin"

- ✅ Должен показать: `✅ Config.js is accessible at: ...`
- ✅ Должен показать содержимое задеплоенного config.js
- ❌ Если config.js не найден - проблема в деплое

## Проверка 2: Проверить бекенд вручную

```bash
# Получить URL бекенда
yc serverless container get \
  --id="<YC_CONTAINER_ID_PROD>" \
  --format json | jq -r '.url'

# Проверить health
curl https://<backend-url>/health

# Проверить admin endpoint
curl https://<backend-url>/api/admin/management/health
```

## Проверка 3: Проверить config.js в админке

1. Откройте админку: `https://<admin-bucket>.website.yandexcloud.net`
2. Откройте консоль браузера (F12)
3. Проверьте:
   ```javascript
   console.log(window.ADMIN_CONFIG?.API_URL);
   ```
4. Должен показать URL контейнера (начинается с `https://` и содержит ID контейнера)

## Проверка 4: Проверить CORS

Убедитесь, что в GitHub Secrets настроены:

- `ADMIN_ORIGINS_PROD` - должен содержать URL админки
- `ALLOWED_ORIGINS_PROD` - должен содержать разрешенные origin'ы

Пример:

```
ADMIN_ORIGINS_PROD=https://lug-admin-deploy-prod.website.yandexcloud.net
ALLOWED_ORIGINS_PROD=https://lug-admin-deploy-prod.website.yandexcloud.net,https://yourdomain.com
```

## Проверка 5: Проверить сетевые запросы

1. Откройте админку в браузере
2. Откройте DevTools → Network
3. Попробуйте выполнить действие, которое вызывает 502
4. Проверьте запрос:
   - **URL**: должен быть `https://<backend-url>/api/admin/management/...`
   - **Status**: если 502 - бекенд не отвечает
   - **Response**: должна быть ошибка от Yandex Cloud

## Типичные проблемы и решения

### Проблема: config.js содержит старый URL функции

**Решение**: Передеплойте админку:

```bash
git commit --allow-empty -m "force deploy all"
git push origin main
```

### Проблема: Бекенд не запускается

**Решение**: Проверьте логи бекенда в Yandex Cloud Console:

1. Откройте Serverless Containers
2. Выберите контейнер
3. Проверьте логи последних запусков

### Проблема: CORS ошибка

**Решение**: Обновите `ADMIN_ORIGINS_PROD` в GitHub Secrets

### Проблема: 502 Bad Gateway

**Решение**:

1. Проверьте, что бекенд запустился (health check)
2. Проверьте, что контейнер имеет достаточно ресурсов
3. Проверьте логи бекенда на ошибки

## Быстрая проверка после деплоя

```bash
# 1. Получить URL бекенда
BACKEND_URL=$(yc serverless container get --id="<YC_CONTAINER_ID_PROD>" --format json | jq -r '.url')

# 2. Проверить health
curl "${BACKEND_URL}/health"

# 3. Проверить admin endpoint
curl "${BACKEND_URL}/api/admin/management/health"

# 4. Проверить config.js в админке
curl "https://<admin-bucket>.website.yandexcloud.net/config.js"
```
