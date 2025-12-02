# Добавление ADMIN_ORIGINS_DEV в GitHub Secrets

## 📋 Инструкция

1. Перейдите в GitHub репозиторий: https://github.com/vidmichd-lab/lug-date

2. Откройте **Settings** → **Secrets and variables** → **Actions**

3. Нажмите **New repository secret**

4. Добавьте следующий секрет:
   - **Name:** `ADMIN_ORIGINS_DEV`
   - **Value:** `https://lug-admin-deploy.website.yandexcloud.net`

5. Нажмите **Add secret**

## ✅ После добавления

Backend будет использовать этот origin в CORS настройках для staging окружения (ветка develop).

## 🔍 Проверка

После деплоя backend будет разрешать запросы от:

- `https://lug-admin-deploy.website.yandexcloud.net` (из ADMIN_ORIGINS_DEV)
- `http://localhost:5174` (для локальной разработки)
- `http://localhost:5173` (для локальной разработки)
- Любые origins из `ALLOWED_ORIGINS` (если установлены)

## 📝 Код CORS

CORS настройки находятся в `backend/src/index.ts` и используют:

```typescript
const allowed = [
  ...(process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || []),
  ...(process.env.ADMIN_ORIGINS?.split(',').map((o) => o.trim()) || []),
  // Default admin origins
  'https://lug-admin-deploy.website.yandexcloud.net',
  'http://localhost:5174',
  'http://localhost:5173',
];
```

---

**Важно:** После добавления секрета нужно передеплоить backend через push в `develop`.
