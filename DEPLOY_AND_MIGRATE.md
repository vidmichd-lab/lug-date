# 🚀 Деплой Backend и Миграции БД

## ✅ Статус

### Backend:
- ✅ Docker образ собран
- ✅ Образ загружен в Container Registry: `cr.yandex/crpe7m04ge3tl5vr8kgj/lug-date-backend:latest`
- ⚠️ Деплой контейнера: Internal error (требует проверки)

### Миграции БД:
- ⏳ Запуск миграций...

---

## 🔧 Решение проблем

### Проблема 1: Internal error при деплое контейнера

Это может быть из-за:
- Недостающих переменных окружения
- Проблем с правами доступа
- Временных проблем Yandex Cloud

**Решение:**
1. Проверьте логи: `/Users/timitro/.config/yandex-cloud/logs/`
2. Попробуйте деплой через GitHub Actions
3. Или используйте существующую ревизию контейнера

### Проблема 2: Запуск миграций

Миграции можно запустить:
1. Локально через собранный код
2. Через GitHub Actions
3. Автоматически при старте backend (если настроено)

---

## 📋 Команды для деплоя и миграций

### Деплой Backend:

```bash
cd /Users/timitro/Downloads/lug
eval "$(/opt/homebrew/bin/brew shellenv)"
export PATH=$HOME/nodejs/bin:$PATH:$HOME/yandex-cloud/bin

# Войти в Container Registry
cat yc-service-account-key.json | docker login --username json_key --password-stdin cr.yandex

# Собрать образ
docker build -t cr.yandex/crpe7m04ge3tl5vr8kgj/lug-date-backend:latest -f backend/Dockerfile .

# Загрузить образ
docker push cr.yandex/crpe7m04ge3tl5vr8kgj/lug-date-backend:latest

# Задеплоить контейнер (с полными переменными окружения)
yc serverless container revision deploy \
  --container-name=lug-date-backend \
  --folder-id=b1g6rst3sps7hhu8tqla \
  --image=cr.yandex/crpe7m04ge3tl5vr8kgj/lug-date-backend:latest \
  --memory=512m \
  --cores=1 \
  --execution-timeout=30s \
  --service-account-id=ajealt724899jtugjv6k \
  --environment "NODE_ENV=production" \
  --environment "CONTAINER_MODE=true" \
  --environment "TELEGRAM_BOT_TOKEN=YOUR_TOKEN" \
  --environment "YDB_ENDPOINT=grpcs://ydb.serverless.yandexcloud.net:2135" \
  --environment "YDB_DATABASE=/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv" \
  --environment "YC_SERVICE_ACCOUNT_KEY=YOUR_KEY_JSON"
```

### Запуск миграций:

```bash
cd /Users/timitro/Downloads/lug/backend
export PATH=$HOME/nodejs/bin:$PATH:$HOME/yandex-cloud/bin
export YC_SERVICE_ACCOUNT_KEY_FILE="$(pwd)/../yc-service-account-key.json"
export YDB_ENDPOINT="grpcs://ydb.serverless.yandexcloud.net:2135"
export YDB_DATABASE="/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv"

# Собрать проект
npm run build --workspace=shared
npm run build --workspace=backend

# Запустить миграции
node dist/db/migrations/run.js
```

---

## 🚀 Альтернатива: GitHub Actions

Если локальный деплой вызывает проблемы, используйте GitHub Actions:

```bash
git add .
git commit -m "Deploy backend and run migrations"
git push origin main
```

GitHub Actions автоматически:
1. Соберет Docker образ
2. Задеплоит контейнер
3. Запустит миграции

---

## 📊 Проверка статуса

### Проверка контейнера:

```bash
yc serverless container get --name=lug-date-backend --folder-id=b1g6rst3sps7hhu8tqla
```

### Проверка миграций:

```bash
cd backend
export YC_SERVICE_ACCOUNT_KEY_FILE="$(pwd)/../yc-service-account-key.json"
node dist/db/migrations/status.js
```

---

## ✨ Итог

- ✅ Образ собран и загружен
- ⏳ Деплой контейнера требует дополнительной настройки переменных окружения
- ⏳ Миграции можно запустить локально или через GitHub Actions

