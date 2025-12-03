# Анализ причин ошибки 502 в бекенде

## Критические проблемы, которые могут вызывать 502

### 1. ❌ Проблема с запуском сервера в контейнере

**Файл**: `backend/src/index.ts:306`

```306:336:backend/src/index.ts
if (require.main === module) {
  // Ensure server starts even if there are async initialization errors
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info({
      type: 'server_started',
      port: PORT,
      environment: config.nodeEnv,
      database: config.database.database || 'not configured',
      message: `Backend server running on port ${PORT} in ${config.nodeEnv} mode`,
    });
  });
```

**Проблема**: В Yandex Cloud Container `require.main === module` может не работать правильно, если файл импортируется как модуль. Это означает, что сервер может не запуститься.

**Решение**: Убрать проверку `require.main === module` и всегда запускать сервер в контейнере, или использовать переменную окружения для определения режима запуска.

---

### 2. ❌ YDB подключение падает приложение в production

**Файл**: `backend/src/db/connection.ts:418-420`

```418:420:backend/src/db/connection.ts
    if (config.nodeEnv === 'production') {
      throw error;
    }
```

**Проблема**: Если YDB не подключается в production, приложение падает с ошибкой. Это может происходить из-за:

- Неправильных credentials
- Проблем с сетью
- Неправильного формата `YC_SERVICE_ACCOUNT_KEY`

**Решение**: Не падать при ошибке подключения, а логировать и продолжать работу. Health check покажет статус БД.

---

### 3. ❌ Неправильная передача YC_SERVICE_ACCOUNT_KEY в workflow

**Файл**: `.github/workflows/deploy-backend.yml:286`

```286:286:.github/workflows/deploy-backend.yml
              --environment YC_SERVICE_ACCOUNT_KEY='${{ secrets.YC_SERVICE_ACCOUNT_KEY }}' \
```

**Проблема**: JSON ключ передается как строка с одинарными кавычками. Если JSON содержит кавычки или специальные символы, это может сломать переменную окружения.

**Решение**: Использовать base64 кодирование или записывать в файл, а не передавать как переменную окружения.

---

### 4. ❌ Проблема с портом

**Файл**: `backend/src/config.ts:63`

```63:63:backend/src/config.ts
    port: Number(process.env.PORT || process.env.API_PORT || 4000),
```

**Проблема**:

- В Dockerfile установлен `ENV PORT=8080`
- Но если переменная окружения не передается правильно, используется дефолт 4000
- Yandex Cloud Container ожидает порт 8080

**Решение**: Убедиться, что `PORT=8080` всегда установлен в контейнере.

---

### 5. ❌ Асинхронная инициализация YDB блокирует старт

**Файл**: `backend/src/index.ts:39-66`

```39:66:backend/src/index.ts
initYDB()
  .then(async () => {
    // Run migrations after successful connection
    try {
      await runMigrations();
      logger.info({
        type: 'ydb_migrations_completed',
        message: 'Migrations completed successfully',
      });
    } catch (error) {
      logger.error({
        error,
        type: 'migrations_failed_on_startup',
        message: 'Migrations failed, but server will continue',
      });
      // Don't exit - allow server to start and handle requests
      // Health check will show DB status
    }
  })
  .catch((error) => {
    logger.error({
      error,
      type: 'ydb_init_failed_on_startup',
      message: 'YDB connection failed, but server will continue. Health check will show DB status.',
    });
    // Don't exit - allow server to start and handle requests
    // This ensures container doesn't crash and health check works
  });
```

**Проблема**: Хотя код не падает, если YDB не подключается в production (из-за `connection.ts:418-420`), это все равно может вызвать проблемы.

**Решение**: Убрать `throw error` в production режиме в `connection.ts`.

---

### 6. ❌ Проблема с handler.ts для контейнера

**Файл**: `backend/src/handler.ts`

**Проблема**: `handler.ts` используется для serverless функций, но для контейнера он не нужен. Если он импортируется где-то, это может вызвать проблемы.

**Решение**: Убедиться, что `handler.ts` не используется в контейнере.

---

### 7. ❌ Проблема с инициализацией Object Storage

**Файл**: `backend/src/services/objectStorage.ts:25-37`

```25:37:backend/src/services/objectStorage.ts
  initialize(): void {
    const bucket = process.env.YANDEX_STORAGE_BUCKET;
    const accessKeyId = process.env.YANDEX_STORAGE_ACCESS_KEY;
    const secretAccessKey = process.env.YANDEX_STORAGE_SECRET_KEY;
    const endpoint = process.env.OBJECT_STORAGE_URL || 'https://storage.yandexcloud.net';

    if (!bucket || !accessKeyId || !secretAccessKey) {
      logger.warn({
        type: 'object_storage_not_configured',
        message: 'Object Storage credentials not found. File uploads will not work.',
      });
      return;
    }
```

**Проблема**: Если переменные окружения не установлены, Object Storage не инициализируется, но это не должно вызывать 502.

---

### 8. ❌ Проблема с зависимостями в package.json

**Файл**: `backend/package.json`

**Проблема**: Если зависимости не установлены правильно или есть конфликты версий, приложение может не запуститься.

**Решение**: Проверить, что все зависимости установлены и совместимы.

---

## Рекомендации по исправлению

### Приоритет 1: Критические исправления

1. **Исправить запуск сервера в контейнере**
   - Убрать проверку `require.main === module` или использовать переменную окружения
   - Всегда запускать сервер в контейнере

2. **Исправить YDB подключение в production**
   - Не падать при ошибке подключения
   - Логировать ошибку и продолжать работу

3. **Исправить передачу YC_SERVICE_ACCOUNT_KEY**
   - Использовать base64 кодирование или файл

### Приоритет 2: Важные исправления

4. **Убедиться, что PORT=8080 всегда установлен**
   - В Dockerfile уже установлен, но проверить передачу в workflow

5. **Добавить более детальное логирование при старте**
   - Логировать все переменные окружения (без секретов)
   - Логировать статус инициализации всех сервисов

### Приоритет 3: Улучшения

6. **Добавить health check с более детальной информацией**
   - Показывать статус всех сервисов
   - Показывать версию приложения

7. **Добавить graceful shutdown**
   - Корректно закрывать соединения при остановке

---

## Как проверить, какая проблема вызывает 502

1. **Проверить логи контейнера в Yandex Cloud Console**
   - Открыть Serverless Containers
   - Выбрать контейнер
   - Проверить логи последних запусков
   - Искать ошибки при старте

2. **Проверить health check**

   ```bash
   curl https://<container-url>/health
   ```

   - Если не отвечает - сервер не запустился
   - Если отвечает - проблема в другом месте

3. **Проверить переменные окружения**
   - В Yandex Cloud Console проверить переменные окружения контейнера
   - Убедиться, что все необходимые переменные установлены

4. **Проверить ресурсы контейнера**
   - Убедиться, что контейнеру достаточно памяти (512m)
   - Убедиться, что timeout достаточен (30s)

---

## Быстрое исправление для тестирования

Если нужно быстро проверить, работает ли сервер:

1. Временно убрать проверку `require.main === module` в `index.ts`
2. Всегда запускать сервер:

   ```typescript
   const server = app.listen(PORT, '0.0.0.0', () => {
     logger.info({ message: `Server started on port ${PORT}` });
   });
   ```

3. Временно убрать `throw error` в production в `connection.ts`:

   ```typescript
   // Don't throw - allow app to start without DB
   logger.error({ error, message: 'YDB connection failed, but continuing' });
   ```

4. Пересобрать и задеплоить:
   ```bash
   git commit -am "fix: always start server in container"
   git push origin main
   ```
