# Настройка Admin Auth (JWT + Refresh Tokens)

## Обзор

Система использует JWT токены для аутентификации админов:

- **Access Token** - короткоживущий (15 минут), используется для API запросов
- **Refresh Token** - долгоживущий (7 дней), используется для обновления access token
- Сессии хранятся в БД для возможности инвалидации

## Преимущества

- ✅ Безопасность - токены с expiration
- ✅ Возможность инвалидации сессий
- ✅ Refresh token механизм
- ✅ Хранение сессий в БД
- ✅ Автоматическая очистка истекших сессий

## Настройка

### 1. Переменные окружения

**Backend (.env):**

```bash
# JWT Secrets (обязательно изменить в production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars

# Опционально (значения по умолчанию)
JWT_EXPIRES_IN=15m          # Время жизни access token
REFRESH_EXPIRES_IN=7d       # Время жизни refresh token
```

**Важно:** Используйте сильные секреты (минимум 32 символа) в production!

### 2. Запустить миграции

```bash
npm run migrate
```

Это создаст таблицы:

- `admins` - список админов
- `admin_sessions` - активные сессии

### 3. Создать первого админа

```bash
npm run create:admin <email> <password>
```

Пример:

```bash
npm run create:admin admin@example.com mySecurePassword123
```

## API Endpoints

### POST /api/admin/auth/login

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "admin": {
      "id": "admin-123",
      "email": "admin@example.com"
    }
  }
}
```

### POST /api/admin/auth/refresh

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### POST /api/admin/auth/logout

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Использование в Admin Panel

### 1. Login

```typescript
const response = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { accessToken, refreshToken } = await response.json();

// Сохранить токены
localStorage.setItem('admin_access_token', accessToken);
localStorage.setItem('admin_refresh_token', refreshToken);
```

### 2. Использование Access Token

```typescript
const accessToken = localStorage.getItem('admin_access_token');

const response = await fetch('/api/admin/analytics/overview', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### 3. Обновление токена

```typescript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('admin_refresh_token');

  const response = await fetch('/api/admin/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (response.ok) {
    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', newRefreshToken);
    return accessToken;
  } else {
    // Refresh token истек - нужно залогиниться заново
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
}

// Interceptor для автоматического обновления токена
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken();
        // Повторить запрос с новым токеном
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios.request(error.config);
      } catch (refreshError) {
        // Не удалось обновить - редирект на login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

### 4. Logout

```typescript
async function logout() {
  const refreshToken = localStorage.getItem('admin_refresh_token');

  await fetch('/api/admin/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  window.location.href = '/login';
}
```

## Безопасность

### Best Practices

1. **Храните секреты в переменных окружения**
   - Никогда не коммитьте JWT_SECRET и JWT_REFRESH_SECRET
   - Используйте разные секреты для разных окружений

2. **Используйте HTTPS в production**
   - Токены передаются в заголовках, HTTPS защищает от перехвата

3. **Регулярно очищайте истекшие сессии**
   - Можно добавить cron job для очистки старых сессий

4. **Ограничьте количество активных сессий**
   - Можно добавить лимит на количество сессий на одного админа

5. **Используйте сильные пароли**
   - Минимум 12 символов
   - Комбинация букв, цифр и символов

## Troubleshooting

### "Invalid or expired token"

- Проверьте, что access token не истек (15 минут)
- Используйте refresh token для получения нового access token

### "Session not found"

- Refresh token был удален (logout) или истек
- Нужно залогиниться заново

### "Admin not found"

- Админ был удален из БД
- Сессия будет автоматически удалена

## Миграция со старой системы

Если у вас была старая система с простым токеном:

1. Запустить миграции: `npm run migrate`
2. Создать админов: `npm run create:admin <email> <password>`
3. Обновить admin panel для использования новых endpoints
4. Удалить старые переменные `ADMIN_TOKEN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
