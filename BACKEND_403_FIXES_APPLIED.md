# Исправления для устранения ошибки 403 в бекенде

## Примененные исправления

### 1. ✅ Улучшено логирование CORS

**Файл**: `backend/src/index.ts`

**Изменения**:

- Добавлено логирование заблокированных CORS запросов в production
- Логируется информация о переменных окружения `ALLOWED_ORIGINS` и `ADMIN_ORIGINS`
- Логируется значение этих переменных (для диагностики)

**Результат**: Теперь в логах видно, почему CORS блокирует запрос и какие origin'ы разрешены.

---

### 2. ✅ Улучшено логирование Admin Auth

**Файл**: `backend/src/middleware/adminAuth.ts`

**Изменения**:

- Добавлено логирование origin и referer в каждом запросе
- Добавлено логирование метода запроса
- Улучшено логирование при ошибках (показывается префикс токена для сравнения)

**Результат**: Теперь в логах видно:

- Откуда приходит запрос (origin, referer)
- Какой метод используется
- Почему авторизация не прошла (нет токена или неправильный токен)

---

### 3. ✅ Улучшена обработка CORS ошибок

**Файл**: `backend/src/middleware/errorHandler.ts`

**Изменения**:

- Добавлена специальная обработка CORS ошибок
- CORS ошибки теперь возвращают код `CORS_ERROR` в ответе
- Логируется origin запроса при CORS ошибке

**Результат**: Теперь при CORS ошибке возвращается понятное сообщение с кодом ошибки.

---

## Как диагностировать проблему 403

### 1. Проверить логи бекенда

В Yandex Cloud Console проверьте логи контейнера на наличие:

**Для CORS проблем:**

```
type: 'cors_blocked'
origin: 'https://...'
allowedOrigins: [...]
hasAllowedOrigins: true/false
hasAdminOrigins: true/false
```

**Для Admin Auth проблем:**

```
type: 'admin_auth_failed'
reason: 'no_token' | 'invalid_token'
origin: 'https://...'
hasAuthHeader: true/false
```

### 2. Проверить переменные окружения

Убедитесь, что в контейнере установлены:

- `ADMIN_ORIGINS` - список разрешенных origin'ов для админки
- `ALLOWED_ORIGINS` - список разрешенных origin'ов
- `ADMIN_TOKEN` - токен для админки

### 3. Проверить запросы в браузере

Откройте DevTools → Network и проверьте:

- **Request Headers**:
  - `Origin`: должен быть в списке разрешенных
  - `Authorization: Bearer <token>`: должен быть для admin endpoints
- **Response**:
  - Если `code: 'CORS_ERROR'` - проблема в CORS настройках
  - Если `code: 'UNAUTHORIZED'` - проблема с токеном

---

## Типичные проблемы и решения

### Проблема 1: CORS_ERROR

**Симптомы**: В ответе `code: 'CORS_ERROR'`

**Решение**:

1. Проверьте `ADMIN_ORIGINS` в GitHub Secrets
2. Убедитесь, что URL админки точно совпадает (включая протокол https://)
3. Передеплойте бекенд после изменения секретов

### Проблема 2: UNAUTHORIZED (no_token)

**Симптомы**: В ответе `code: 'UNAUTHORIZED'`, в логах `reason: 'no_token'`

**Решение**:

1. Проверьте, что токен передается в заголовке: `Authorization: Bearer <token>`
2. Проверьте, что вы залогинились в админке
3. Проверьте localStorage: `localStorage.getItem('admin_token')`

### Проблема 3: UNAUTHORIZED (invalid_token)

**Симптомы**: В ответе `code: 'UNAUTHORIZED'`, в логах `reason: 'invalid_token'`

**Решение**:

1. Проверьте, что `ADMIN_TOKEN` в GitHub Secrets совпадает с токеном, который используется
2. Попробуйте залогиниться заново
3. Очистите localStorage и перезагрузите страницу

---

## Проверка после исправлений

### 1. Проверить health check

```bash
curl https://<container-url>/health
```

Должен вернуть 200 OK.

### 2. Проверить CORS для админки

```bash
curl -H "Origin: https://<admin-url>" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     "https://<container-url>/api/admin/management/health" \
     -v
```

Должен вернуть:

- `Access-Control-Allow-Origin: https://<admin-url>`
- Status 200

### 3. Проверить логи

После запроса проверьте логи бекенда:

- Должны быть записи `admin_auth_check` или `cors_check`
- Если есть `cors_blocked` или `admin_auth_failed` - смотрите детали в логах

---

## Следующие шаги

1. Закоммитьте изменения:

   ```bash
   git add .
   git commit -m "fix: улучшено логирование для диагностики ошибки 403"
   git push origin main
   ```

2. Дождитесь завершения деплоя

3. Проверьте логи бекенда при следующем запросе с 403

4. Используйте информацию из логов для дальнейшей диагностики
