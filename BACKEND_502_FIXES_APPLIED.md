# Исправления для устранения ошибки 502 в бекенде

## Примененные исправления

### 1. ✅ Исправлен запуск сервера в контейнере

**Файл**: `backend/src/index.ts`

**Проблема**: Проверка `require.main === module` может не работать в Yandex Cloud Container, что приводит к тому, что сервер не запускается.

**Решение**:

- Добавлена проверка переменной окружения `CONTAINER_MODE=true`
- Сервер запускается, если `CONTAINER_MODE=true` или `require.main === module`
- Добавлено детальное логирование режима запуска

**Изменения**:

```typescript
const isServerless = process.env.SERVERLESS === 'true';
const isMainModule = require.main === module;
const shouldStartServer = !isServerless && (isMainModule || process.env.CONTAINER_MODE === 'true');
```

---

### 2. ✅ Исправлено YDB подключение в production

**Файл**: `backend/src/db/connection.ts`

**Проблема**: Если YDB не подключается в production, приложение падает с ошибкой, что вызывает 502.

**Решение**:

- Убрано `throw error` в production режиме
- Приложение продолжает работу даже если YDB не подключен
- Health check endpoint показывает статус БД
- Добавлена попытка отправить alert о проблеме с БД

**Изменения**:

```typescript
// Don't throw - allow app to start without DB even in production
// Health check endpoint will show DB status
// This prevents container from crashing and allows debugging
logger.warn({
  type: 'ydb_init_skipped',
  reason: 'connection_failed_but_continuing',
  environment: config.nodeEnv,
  message: 'YDB connection failed, but server will continue. Health check will show DB status.',
});
```

---

### 3. ✅ Исправлена передача YC_SERVICE_ACCOUNT_KEY

**Файл**: `.github/workflows/deploy-backend.yml`

**Проблема**: JSON ключ передавался с одинарными кавычками, что могло сломать переменную окружения.

**Решение**:

- Изменены одинарные кавычки на двойные для правильного экранирования
- Добавлена переменная `CONTAINER_MODE=true` в workflow
- Добавлена переменная `PORT=8080` для гарантии правильного порта

**Изменения**:

```yaml
--environment CONTAINER_MODE=true \
--environment PORT=8080 \
--environment YC_SERVICE_ACCOUNT_KEY="${{ secrets.YC_SERVICE_ACCOUNT_KEY }}" \
```

---

### 4. ✅ Добавлено детальное логирование при старте

**Файл**: `backend/src/index.ts`

**Решение**: Добавлено логирование всех важных параметров при старте (без секретов) для упрощения диагностики.

**Изменения**:

```typescript
logger.info({
  type: 'app_startup',
  nodeEnv: config.nodeEnv,
  port: config.port,
  databaseEndpoint: config.database.endpoint ? 'configured' : 'not configured',
  databaseName: config.database.database || 'not configured',
  hasTelegramToken: !!config.telegram.botToken,
  hasStorageBucket: !!process.env.YANDEX_STORAGE_BUCKET,
  hasStorageAccessKey: !!process.env.YANDEX_STORAGE_ACCESS_KEY,
  containerMode: process.env.CONTAINER_MODE === 'true',
  isServerless: process.env.SERVERLESS === 'true',
  isMainModule: require.main === module,
  message: 'Application starting...',
});
```

---

### 5. ✅ Добавлена переменная CONTAINER_MODE в Dockerfile

**Файл**: `backend/Dockerfile`

**Решение**: Добавлена переменная окружения `CONTAINER_MODE=true` в Dockerfile для гарантии правильного режима запуска.

**Изменения**:

```dockerfile
ENV NODE_ENV=production
ENV PORT=8080
ENV CONTAINER_MODE=true
```

---

## Как проверить исправления

### 1. Проверить логи при старте

После деплоя проверьте логи контейнера в Yandex Cloud Console. Должны быть видны:

- `app_startup` - информация о старте
- `server_started` - подтверждение запуска сервера
- `ydb_init_starting` - попытка подключения к YDB
- `ydb_connection` или `ydb_init_failed` - результат подключения

### 2. Проверить health check

```bash
# Получить URL контейнера
BACKEND_URL=$(yc serverless container get --id="<YC_CONTAINER_ID>" --format json | jq -r '.url')

# Проверить health
curl "${BACKEND_URL}/health"
```

Должен вернуть:

```json
{
  "status": "ok",
  "service": "backend",
  "database": "connected" | "disconnected",
  "timestamp": "..."
}
```

### 3. Проверить переменные окружения

В Yandex Cloud Console проверьте, что в контейнере установлены:

- `CONTAINER_MODE=true`
- `PORT=8080`
- `NODE_ENV=production`
- Все остальные необходимые переменные

---

## Ожидаемое поведение после исправлений

1. **Сервер всегда запускается** в контейнере (если `CONTAINER_MODE=true`)
2. **Приложение не падает** при ошибке подключения к YDB
3. **Health check работает** даже если БД не подключена
4. **Детальные логи** помогают диагностировать проблемы

---

## Если проблема сохраняется

Если после исправлений все еще возникает 502:

1. **Проверьте логи контейнера** в Yandex Cloud Console
   - Ищите ошибки при старте
   - Проверьте, что сервер запустился (`server_started`)

2. **Проверьте переменные окружения**
   - Убедитесь, что все секреты установлены
   - Проверьте формат `YC_SERVICE_ACCOUNT_KEY` (должен быть валидный JSON)

3. **Проверьте ресурсы контейнера**
   - Память: минимум 512m
   - Timeout: минимум 30s
   - CPU: минимум 1 core

4. **Проверьте сетевые настройки**
   - Убедитесь, что контейнер может обращаться к YDB
   - Проверьте firewall правила

---

## Следующие шаги

После применения исправлений:

1. Закоммитьте изменения:

   ```bash
   git add .
   git commit -m "fix: исправления для устранения ошибки 502 в бекенде"
   git push origin main
   ```

2. Дождитесь завершения деплоя в GitHub Actions

3. Проверьте health check endpoint

4. Проверьте логи контейнера на наличие ошибок
