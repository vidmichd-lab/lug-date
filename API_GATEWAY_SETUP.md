# Настройка API Gateway для Dating App

## 🎯 Цель

Настроить API Gateway для работы с бекендом через обычные HTTP URL (например, `/health`, `/api/admin/management/users`).

## 📋 Требования

- Yandex Cloud CLI (`yc`) установлен и настроен
- Функция бекенда задеплоена (ID: `d4enks8erf8eentnojj9`)
- Права на создание API Gateway в Yandex Cloud

## 🚀 Быстрая настройка

### Шаг 1: Создание API Gateway

```bash
yc serverless api-gateway create \
  --name dating-app-api \
  --description "API Gateway для Dating App Backend" \
  --spec api-gateway-spec.yaml
```

### Шаг 2: Получение URL Gateway

```bash
yc serverless api-gateway get --name dating-app-api --format json | jq -r '.domain'
```

Или через консоль:

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в **Serverless** → **API Gateway**
3. Найдите `dating-app-api`
4. Скопируйте **Domain** (URL вида: `https://<gateway-id>.apigw.yandexcloud.net`)

### Шаг 3: Проверка работы

```bash
# Health check
curl https://<gateway-id>.apigw.yandexcloud.net/health

# Должен вернуть: {"status":"ok","service":"backend"}
```

### Шаг 4: Обновление админки

Обновите `admin/public/config.js` с URL Gateway:

```javascript
window.ADMIN_CONFIG = {
  API_URL: 'https://<gateway-id>.apigw.yandexcloud.net',
};
```

Затем задеплойте админку:

```bash
BACKEND_URL='https://<gateway-id>.apigw.yandexcloud.net' npm run deploy:admin
```

## 📝 Детальная настройка

### Вариант 1: Через Yandex Cloud Console

1. **Откройте консоль:**
   - [Yandex Cloud Console](https://console.cloud.yandex.ru/)
   - Перейдите в **Serverless** → **API Gateway**

2. **Создайте API Gateway:**
   - Нажмите **"Создать API Gateway"**
   - Имя: `dating-app-api`
   - Описание: `API Gateway для Dating App Backend`

3. **Настройте спецификацию:**
   - Выберите **"Редактор спецификации"**
   - Вставьте содержимое файла `api-gateway-spec.yaml`
   - Или используйте **"Импорт из файла"**

4. **Сохраните и получите URL:**
   - После создания вы получите URL вида: `https://<gateway-id>.apigw.yandexcloud.net`

### Вариант 2: Через Yandex Cloud CLI

1. **Создайте API Gateway:**

   ```bash
   yc serverless api-gateway create \
     --name dating-app-api \
     --description "API Gateway для Dating App Backend" \
     --spec api-gateway-spec.yaml
   ```

2. **Получите информацию о Gateway:**

   ```bash
   yc serverless api-gateway get --name dating-app-api
   ```

3. **Получите только URL:**
   ```bash
   yc serverless api-gateway get --name dating-app-api --format json | jq -r '.domain'
   ```

### Вариант 3: Обновление существующего Gateway

Если Gateway уже существует:

```bash
yc serverless api-gateway update \
  --name dating-app-api \
  --spec api-gateway-spec.yaml
```

## 🔧 Спецификация API Gateway

Файл `api-gateway-spec.yaml` содержит:

- **Проксирование всех путей** (`/{proxy+}`) к Cloud Function
- **Поддержка всех HTTP методов** (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- **Автоматическое определение service account**

### Структура спецификации:

```yaml
paths:
  /{proxy+}:
    x-yc-apigateway-any-method:
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: d4enks8erf8eentnojj9
        service_account_id: auto
```

## ✅ Проверка работы

### 1. Health Check

```bash
curl https://<gateway-id>.apigw.yandexcloud.net/health
```

Ожидаемый ответ:

```json
{ "status": "ok", "service": "backend" }
```

### 2. API Endpoints

```bash
# Получить пользователей
curl https://<gateway-id>.apigw.yandexcloud.net/api/admin/management/users

# Получить события
curl https://<gateway-id>.apigw.yandexcloud.net/api/admin/management/events
```

### 3. CORS

Проверьте, что CORS работает:

```bash
curl -X OPTIONS https://<gateway-id>.apigw.yandexcloud.net/api/admin/management/users \
  -H "Origin: https://lug-admin-deploy.website.yandexcloud.net" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Должны быть заголовки:

- `Access-Control-Allow-Origin: https://lug-admin-deploy.website.yandexcloud.net`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`

## 🔄 Обновление админки

После получения URL Gateway:

1. **Обновите config.js:**

   ```bash
   # Установите переменную окружения
   export BACKEND_URL='https://<gateway-id>.apigw.yandexcloud.net'

   # Или обновите admin/public/config.js вручную
   ```

2. **Задеплойте админку:**

   ```bash
   BACKEND_URL='https://<gateway-id>.apigw.yandexcloud.net' npm run deploy:admin
   ```

3. **Проверьте в браузере:**
   - Откройте: https://lug-admin-deploy.website.yandexcloud.net/
   - Проверьте консоль браузера (F12) - не должно быть ошибок CORS
   - Попробуйте загрузить пользователей или события

## 🐛 Решение проблем

### Ошибка: "Function not found"

**Решение:** Проверьте, что ID функции правильный:

```bash
yc serverless function list
```

### Ошибка: "Access denied"

**Решение:** Проверьте права доступа:

- Убедитесь, что service account имеет права на вызов функции
- Проверьте настройки функции (публичный доступ)

### Ошибка: "CORS not working"

**Решение:**

- Проверьте настройки CORS в бекенде (`backend/src/index.ts`)
- Убедитесь, что origin админки добавлен в `ALLOWED_ORIGINS` или в список по умолчанию

### Ошибка: "Gateway timeout"

**Решение:**

- Увеличьте timeout в спецификации Gateway
- Проверьте, что функция отвечает быстро

## 📊 Мониторинг

### Просмотр логов Gateway

```bash
yc serverless api-gateway logs --name dating-app-api
```

### Просмотр метрик

В Yandex Cloud Console:

- **Serverless** → **API Gateway** → `dating-app-api` → **Метрики**

## 🔐 Безопасность

### Рекомендации:

1. **Ограничьте доступ по IP** (если возможно)
2. **Используйте API Keys** для защиты Gateway
3. **Настройте rate limiting** в Gateway
4. **Включите логирование** всех запросов

## 📚 Дополнительные ресурсы

- [Документация Yandex API Gateway](https://cloud.yandex.ru/docs/api-gateway/)
- [Примеры спецификаций](https://cloud.yandex.ru/docs/api-gateway/concepts/specification)
- [Настройка CORS](https://cloud.yandex.ru/docs/api-gateway/concepts/cors)

## ✅ Чеклист

- [ ] API Gateway создан
- [ ] Спецификация применена
- [ ] URL Gateway получен
- [ ] Health check работает
- [ ] API endpoints работают
- [ ] CORS настроен
- [ ] Админка обновлена с новым URL
- [ ] Админка задеплоена
- [ ] Проверено в браузере

---

**После настройки API Gateway админка должна работать корректно!**
