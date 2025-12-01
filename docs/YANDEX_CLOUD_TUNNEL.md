# Туннелирование локального сервера через Yandex Cloud

Российская альтернатива ngrok на основе Yandex Cloud для локальной разработки Telegram Web App.

## 📋 Варианты решения

### ⭐ Вариант 0: Yandex Object Storage (Рекомендуется - Без терминала!)
**Самый простой способ** - загрузите собранный frontend в Object Storage через веб-интерфейс.
- ✅ Не требует терминала
- ✅ Только веб-интерфейс Yandex Cloud
- ✅ Стабильный HTTPS URL
- 📖 [Подробная инструкция](YANDEX_OBJECT_STORAGE_DEPLOY.md)

### Вариант 1: Yandex Cloud Functions
Используем Cloud Function с HTTP триггером для проксирования запросов на локальный сервер.

### Вариант 2: Yandex API Gateway
Настраиваем API Gateway как прокси для локального сервера.

### Вариант 3: Быстрый деплой в Yandex Cloud Run
Деплоим frontend в Cloud Run для тестирования (альтернатива Docker).

---

## Вариант 1: Yandex Cloud Functions (Прокси-туннель)

### Преимущества:
- ✅ Бесплатный тариф (до 1 млн запросов в месяц)
- ✅ Автоматический HTTPS
- ✅ Стабильный URL
- ✅ Работает в России без VPN

### Шаг 1.1: Создание Cloud Function

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в **"Cloud Functions"** → **"Functions"**
3. Нажмите **"Создать функцию"**
4. Заполните:
   - **Имя:** `telegram-web-app-proxy`
   - **Описание:** `Прокси для локального Telegram Web App`
   - **Среда выполнения:** `nodejs18` или `nodejs20`

### Шаг 1.2: Код функции-прокси

Создайте файл `proxy-function.js`:

```javascript
/**
 * Yandex Cloud Function для проксирования запросов на локальный сервер
 * 
 * Настройка:
 * 1. Создайте переменную окружения LOCAL_SERVER_URL с вашим локальным адресом
 * 2. Или используйте ngrok/другой туннель для локального сервера
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// URL локального сервера (можно изменить через переменные окружения)
const LOCAL_SERVER_URL = process.env.LOCAL_SERVER_URL || 'http://localhost:3000';

/**
 * Проксирование запроса
 */
async function proxyRequest(event, context) {
  const { httpMethod, path, headers, body, queryStringParameters } = event;
  
  // Формируем URL для локального сервера
  const localUrl = new URL(path || '/', LOCAL_SERVER_URL);
  
  // Добавляем query параметры
  if (queryStringParameters) {
    Object.entries(queryStringParameters).forEach(([key, value]) => {
      localUrl.searchParams.append(key, value);
    });
  }
  
  // Удаляем заголовки, которые могут вызвать проблемы
  const proxyHeaders = { ...headers };
  delete proxyHeaders['host'];
  delete proxyHeaders['connection'];
  delete proxyHeaders['content-length'];
  
  // Добавляем заголовки для проксирования
  proxyHeaders['x-forwarded-for'] = event.requestContext?.sourceIp || '127.0.0.1';
  proxyHeaders['x-forwarded-proto'] = 'https';
  
  return new Promise((resolve, reject) => {
    const url = new URL(localUrl.toString());
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: httpMethod || 'GET',
      headers: proxyHeaders,
      timeout: 30000,
    };
    
    const req = client.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        // Формируем ответ для API Gateway
        const response = {
          statusCode: res.statusCode || 200,
          headers: {
            'Content-Type': res.headers['content-type'] || 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...res.headers,
          },
          body: responseBody,
          isBase64Encoded: false,
        };
        
        resolve(response);
      });
    });
    
    req.on('error', (error) => {
      console.error('Proxy error:', error);
      resolve({
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Failed to connect to local server',
          message: error.message,
        }),
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 504,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Gateway timeout',
          message: 'Local server did not respond in time',
        }),
      });
    });
    
    // Отправляем тело запроса, если есть
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

// Обработчик для Yandex Cloud Functions
module.exports.handler = async (event, context) => {
  try {
    return await proxyRequest(event, context);
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
```

### Шаг 1.3: Деплой функции

1. В консоли Yandex Cloud:
   - Перейдите в созданную функцию
   - Откройте вкладку **"Редактор"**
   - Вставьте код функции
   - Нажмите **"Создать версию"**

2. Настройте переменные окружения:
   - Перейдите в **"Редактор"** → **"Переменные окружения"**
   - Добавьте: `LOCAL_SERVER_URL` = `https://abc123.serveo.net` (URL из SSH туннеля)
   - ⚠️ **Важно:** Сначала получите URL через SSH туннель (`npm run tunnel`), затем используйте его здесь

3. Настройте HTTP триггер:
   - Перейдите в **"Триггеры"** → **"Создать триггер"**
   - Выберите **"HTTP триггер"**
   - Настройте:
     - **URL:** `https://functions.yandexcloud.net/your-function-id`
     - **Методы:** `GET, POST, PUT, DELETE, OPTIONS`
     - **Публичный доступ:** Включен

### Шаг 1.4: Использование

После создания функции вы получите URL вида:
```
https://functions.yandexcloud.net/your-function-id
```

Используйте этот URL в BotFather как Web App URL.

**⚠️ Важно:** Для работы функции нужен доступный из интернета локальный сервер. 
- Получите URL через SSH туннель: `npm run tunnel` (см. "Быстрый старт")
- Или используйте **Вариант 0** (Object Storage) - не требует туннеля!

---

## Вариант 2: Yandex API Gateway (Статический прокси)

### Преимущества:
- ✅ Стабильный URL
- ✅ Настройка через консоль
- ✅ Поддержка HTTPS

### Шаг 2.1: Создание API Gateway

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в **"API Gateway"**
3. Нажмите **"Создать API Gateway"**
4. Заполните:
   - **Имя:** `telegram-web-app-gateway`
   - **Описание:** `Прокси для Telegram Web App`

### Шаг 2.2: Настройка спецификации

Вставьте следующую спецификацию OpenAPI:

```yaml
openapi: 3.0.0
info:
  title: Telegram Web App Proxy
  version: 1.0.0
paths:
  /{proxy+}:
    x-yc-apigateway-any-method:
      x-yc-apigateway-integration:
        type: http
        url: http://your-local-server-url:3000/{proxy}
        method: ANY
        timeout_ms: 30000
        headers:
          x-forwarded-for: '{context.requestId}'
```

**⚠️ Замените:** `your-local-server-url` на ваш доступный URL (получите через SSH туннель: `npm run tunnel`).

### Шаг 2.3: Получение URL

После создания API Gateway вы получите URL вида:
```
https://your-gateway-id.apigw.yandexcloud.net
```

Используйте этот URL в BotFather.

---

## Вариант 3: Быстрый деплой в Yandex Cloud Run

### Преимущества:
- ✅ Не нужен локальный туннель
- ✅ Полноценный деплой
- ✅ Автоматический HTTPS
- ✅ Стабильный URL

### Шаг 3.1: Подготовка проекта

1. Убедитесь, что frontend собирается:
```bash
npm run build:frontend
```

### Шаг 3.2: Создание Dockerfile (если нужен)

Создайте `frontend/Dockerfile`:

```dockerfile
FROM nginx:alpine

# Копируем собранные файлы
COPY dist /usr/share/nginx/html

# Настраиваем nginx для SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Шаг 3.3: Деплой через Yandex Cloud Run

**Альтернатива без Docker:** Используйте Yandex Cloud Functions для статики:

1. Соберите frontend:
```bash
npm run build:frontend
```

2. Загрузите файлы в Yandex Object Storage:
```bash
# Установите Yandex CLI
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash

# Настройте профиль
yc init

# Загрузите файлы
yc storage cp -r frontend/dist/* s3://your-bucket-name/
```

3. Настройте публичный доступ к bucket

4. Используйте CDN URL в BotFather

---

## Рекомендуемое решение для локальной разработки

### Комбинированный подход:

1. **Для локального сервера:** Используйте простой туннель (например, [serveo.net](https://serveo.net) или [localhost.run](https://localhost.run))
2. **Для проксирования:** Используйте Yandex Cloud Functions (Вариант 1)
3. **Для production:** Используйте Yandex Object Storage + CDN или Cloud Run

### Пример настройки:

```bash
# 1. Запустите локальный сервер
npm run dev:frontend

# 2. Используйте простой SSH туннель (не требует установки)
ssh -R 80:localhost:3000 serveo.net

# Или используйте localhost.run
ssh -R yourname:80:localhost:3000 ssh.localhost.run

# 3. Получите URL (например: https://yourname.serveo.net)
# 4. Настройте Yandex Cloud Function с LOCAL_SERVER_URL = https://yourname.serveo.net
# 5. Используйте URL функции в BotFather
```

---

## Альтернативные российские решения

### 1. Selectel Cloud (Российский провайдер)
- Аналог Yandex Cloud
- Поддержка контейнеров и функций
- Работает в России

### 2. Timeweb Cloud (Российский провайдер)
- Виртуальные серверы
- Поддержка Docker
- Работает в России

### 3. VK Cloud (бывший Mail.ru Cloud)
- Облачная платформа
- Поддержка контейнеров
- Работает в России

---

## Быстрый старт (Минимальная настройка)

### Способ 1: Yandex Object Storage (Без терминала) ⭐

**Самый простой способ - только веб-интерфейс:**

1. Соберите frontend (или попросите коллегу): `npm run build:frontend`
2. Откройте Yandex Cloud Console → Object Storage
3. Создайте публичный бакет
4. Загрузите файлы из `frontend/dist/` через веб-интерфейс
5. Настройте веб-сайт в бакете
6. Используйте URL в BotFather

📖 [Подробная инструкция](YANDEX_OBJECT_STORAGE_DEPLOY.md)

### Способ 2: SSH туннель (Если нужен терминал)

Если у вас есть доступ к терминалу:

1. **Используйте SSH туннель (бесплатно, без установки):**
```bash
# В терминале
ssh -R 80:localhost:3000 serveo.net
```

2. **Получите URL** (например: `https://abc123.serveo.net`)

3. **Используйте этот URL в BotFather**

4. **Для production:** Деплойте в Yandex Object Storage + CDN

---

## Полезные ссылки

- [Yandex Cloud Functions Documentation](https://cloud.yandex.ru/docs/functions/)
- [Yandex API Gateway Documentation](https://cloud.yandex.ru/docs/api-gateway/)
- [Yandex Object Storage Documentation](https://cloud.yandex.ru/docs/storage/)
- [Yandex Cloud Run Documentation](https://cloud.yandex.ru/docs/cloud-run/)

---

**Последнее обновление:** 2024-12-01

