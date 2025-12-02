# Исправление проблемы с Backend в Yandex Cloud Functions

## Проблема

При обращении к бекенду возникает ошибка:
```
{"errorCode":400,"errorMessage":"Invalid functionID: /d4er75rsvc5mopabt70v/health"}
```

Или:
```
{"errorCode":404,"errorMessage":"Not Found: Tag $latest not found for function d4er75rsvc5mopabt70v"}
```

## Причины

1. **Функция не задеплоена** - функция отсутствует или задеплоена с другим тегом
2. **Неправильный формат URL** - Yandex Cloud Functions не поддерживает пути в URL напрямую
3. **Нужен API Gateway** - для работы с обычными HTTP URL нужен API Gateway

## Решения

### Вариант 1: Настроить API Gateway (Рекомендуется)

API Gateway позволяет использовать обычные URL с путями:

1. **Создайте API Gateway:**
   ```bash
   yc serverless api-gateway create --name dating-app-api
   ```

2. **Создайте спецификацию API Gateway:**
   
   Создайте файл `api-gateway-spec.yaml`:
   ```yaml
   openapi: 3.0.0
   info:
     title: Dating App API
     version: 1.0.0
   paths:
     /{proxy+}:
       x-yc-apigateway-any-method:
         x-yc-apigateway-integration:
           type: cloud_functions
           function_id: d4er75rsvc5mopabt70v
           service_account_id: <your-service-account-id>
   ```

3. **Обновите API Gateway:**
   ```bash
   yc serverless api-gateway update --name dating-app-api --spec api-gateway-spec.yaml
   ```

4. **Получите URL Gateway:**
   ```bash
   yc serverless api-gateway get --name dating-app-api
   ```
   
   URL будет вида: `https://<gateway-id>.apigw.yandexcloud.net`

5. **Обновите config.js в админке:**
   ```javascript
   window.ADMIN_CONFIG = {
     API_URL: 'https://<gateway-id>.apigw.yandexcloud.net'
   };
   ```

### Вариант 2: Задеплоить функцию заново

Если функция не задеплоена:

1. **Проверьте, существует ли функция:**
   ```bash
   yc serverless function list
   ```

2. **Если функции нет, создайте её:**
   ```bash
   yc serverless function create --name dating-app-backend
   ```

3. **Задеплойте функцию:**
   ```bash
   cd backend
   npm run build
   yc serverless function version create \
     --function-name dating-app-backend \
     --runtime nodejs18 \
     --entrypoint dist/handler.handler \
     --memory 128m \
     --execution-timeout 30s \
     --source-path dist
   ```

4. **Получите ID функции:**
   ```bash
   yc serverless function get --name dating-app-backend
   ```

5. **Обновите config.js с правильным ID функции**

### Вариант 3: Использовать правильный формат вызова функции

Без API Gateway нужно использовать специальный формат:

```javascript
// В админке нужно отправлять запросы через POST с телом:
{
  "httpMethod": "GET",
  "path": "/health",
  "headers": {},
  "queryStringParameters": {}
}
```

Но это неудобно для админки, поэтому лучше использовать API Gateway.

## Проверка

После настройки API Gateway проверьте:

```bash
# Health check
curl https://<gateway-id>.apigw.yandexcloud.net/health

# API endpoint
curl https://<gateway-id>.apigw.yandexcloud.net/api/admin/management/users
```

## Обновление админки

После настройки API Gateway:

1. Обновите `admin/public/config.js` с URL Gateway
2. Пересоберите админку: `npm run build:admin`
3. Задеплойте админку: `npm run deploy:admin`

## Текущий статус

- ❌ Функция не найдена или не задеплоена
- ❌ API Gateway не настроен
- ✅ Код бекенда готов к деплою
- ✅ CORS настроен для админки

## Следующие шаги

1. Настроить API Gateway (Вариант 1) - самый простой способ
2. Или задеплоить функцию и настроить правильный формат вызова
3. Обновить config.js в админке
4. Пересобрать и задеплоить админку

