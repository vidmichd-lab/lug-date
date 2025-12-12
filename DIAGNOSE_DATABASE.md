# Диагностика ошибки "Database connection failed"

## Возможные причины и решения

### 1. DATABASE_URL не установлен

**Проверка:**

```bash
echo $DATABASE_URL
```

**Решение:**

- Установите `DATABASE_URL` в GitHub Secrets
- Формат: `postgresql://user:password@host:port/database`

### 2. Неправильный формат connection string

**Правильный формат:**

```
postgresql://events_user:BIa8gxlSjYRw3E8Q@rc1a-0cfp3m8m0t4ah677.mdb.yandexcloud.net:6432/events_db
```

**Проверьте:**

- ✅ Протокол: `postgresql://` (не `postgres://`)
- ✅ Пользователь: `events_user`
- ✅ Пароль: правильный пароль
- ✅ Хост: FQDN из консоли Yandex Cloud
- ✅ Порт: `6432` (стандартный для Yandex Cloud)
- ✅ База данных: `events_db`

### 3. Публичный доступ не включен

**Решение:**

1. Откройте Yandex Cloud Console
2. Managed PostgreSQL → ваш кластер
3. Хосты → Настроить
4. Включите "Публичный доступ"

### 4. IP адрес не в whitelist

**Решение:**

1. В настройках кластера
2. Секция "Безопасность"
3. Добавьте IP адрес сервера/контейнера в whitelist
4. Или разрешите доступ из всех источников (0.0.0.0/0)

### 5. Неправильный порт

**Проверьте:**

- Yandex Cloud PostgreSQL обычно использует порт `6432`
- Убедитесь, что в connection string указан правильный порт

### 6. Проблемы с SSL

**Решение:**
Код уже настроен для работы с self-signed сертификатами:

```typescript
ssl: {
  rejectUnauthorized: false;
}
```

## Тестирование подключения

### Локально:

```bash
npm run test:postgres --workspace=backend
```

### В GitHub Actions:

Проверьте логи workflow на наличие ошибок подключения.

## Проверка health endpoint

```bash
curl https://bba2from3lh3r2baegq5.containers.yandexcloud.net/health
```

Должен вернуть статус базы данных.

## Типичные ошибки

### ENOTFOUND

- **Причина:** Хост не найден
- **Решение:** Проверьте FQDN в DATABASE_URL

### ETIMEDOUT / ECONNREFUSED

- **Причина:** Соединение отклонено или таймаут
- **Решение:** Включите публичный доступ, проверьте firewall

### password authentication failed

- **Причина:** Неправильный пароль
- **Решение:** Проверьте пароль в DATABASE_URL

### database does not exist

- **Причина:** Неправильное имя базы данных
- **Решение:** Проверьте имя базы в DATABASE_URL
