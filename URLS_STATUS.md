# 📍 Ссылки и статус сервисов

## ✅ Работающие сервисы

### 1. Admin панель

**URL:** https://lug-admin-deploy.website.yandexcloud.net/

- ✅ Работает (200 OK)
- ✅ Настроена на backend
- ✅ Можно открыть в браузере

### 2. Backend API

**URL:** https://functions.yandexcloud.net/d4er75rsvc5mopabt70v

- ✅ Работает
- Health check: `https://functions.yandexcloud.net/d4er75rsvc5mopabt70v/api/v1/health`
- API endpoints: `https://functions.yandexcloud.net/d4er75rsvc5mopabt70v/api/v1/*`

---

## ❌ Не работает

### Frontend (Telegram Mini App)

**Проблема:** Frontend не задеплоен в Object Storage

**Причина:**

- Локальный деплой не сработал (неправильные ключи доступа)
- GitHub Actions может не запуститься, если нет секретов

**Решение:**

#### Вариант 1: Проверить GitHub Actions (самый простой)

1. Откройте: https://github.com/vidmichd-lab/lug-date/actions
2. Найдите workflow "Deploy Frontend to Yandex Object Storage"
3. Если он не запустился - нажмите "Run workflow" вручную
4. Если запустился, но упал - проверьте секреты в GitHub Settings → Secrets

#### Вариант 2: Задеплоить вручную (если есть правильные ключи)

1. Убедитесь, что в `.env` правильные ключи:
   ```env
   FRONTEND_STORAGE_BUCKET_DEV=ваш-бакет
   FRONTEND_STORAGE_ACCESS_KEY_DEV=ваш-ключ
   FRONTEND_STORAGE_SECRET_KEY_DEV=ваш-секрет
   ```
2. Запустите: `npm run deploy:frontend`

#### Вариант 3: Использовать GitHub Actions с правильными секретами

1. Добавьте секреты в GitHub:
   - Settings → Secrets and variables → Actions
   - Добавьте:
     - `FRONTEND_STORAGE_BUCKET_DEV`
     - `FRONTEND_STORAGE_ACCESS_KEY_DEV`
     - `FRONTEND_STORAGE_SECRET_KEY_DEV`
2. Запустите workflow вручную или сделайте push

---

## 🔍 Как проверить статус

### Admin панель

```bash
curl https://lug-admin-deploy.website.yandexcloud.net/
# Должен вернуть HTML (200 OK)
```

### Backend API

```bash
curl https://functions.yandexcloud.net/d4er75rsvc5mopabt70v/api/v1/health
# Должен вернуть: {"status":"ok","service":"backend"}
```

### Frontend

```bash
# После деплоя проверьте URL бакета:
curl https://ВАШ-БАКЕТ.website.yandexcloud.net/
# Должен вернуть HTML (200 OK)
```

---

## 📱 Настройка Telegram бота

После того, как frontend будет задеплоен:

1. Получите URL frontend (будет показан после деплоя)
2. Откройте BotFather в Telegram
3. Отправьте команду: `/setmenubutton`
4. Выберите вашего бота
5. Введите URL frontend (например: `https://ваш-бакет.website.yandexcloud.net/`)
6. Готово! Приложение будет доступно в боте

---

## 🎯 Итоговый чеклист

- [x] Admin панель работает
- [x] Backend API работает
- [ ] Frontend задеплоен
- [ ] URL frontend добавлен в BotFather
- [ ] Приложение открывается в Telegram боте

---

**Последнее обновление:** $(date)
