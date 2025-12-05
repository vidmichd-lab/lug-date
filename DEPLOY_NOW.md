# 🚀 Быстрый деплой на Yandex Cloud

## Вариант 1: Через GitHub Actions (Рекомендуется) ⭐

Самый простой способ - использовать автоматический деплой через GitHub Actions.

### Шаги:

1. **Убедитесь, что все изменения закоммичены:**
   ```bash
   git status
   git add .
   git commit -m "Deploy to Yandex Cloud"
   ```

2. **Запушьте в main ветку:**
   ```bash
   git push origin main
   ```

3. **Проверьте статус деплоя:**
   - Откройте: https://github.com/vidmichd-lab/lug-date/actions
   - Найдите workflow "Deploy to Yandex Cloud"
   - Дождитесь завершения (обычно 5-10 минут)

### Что будет задеплоено:

- ✅ Backend → Yandex Cloud Container
- ✅ Frontend → Yandex Object Storage
- ✅ Admin → Yandex Object Storage
- ✅ Bot → Yandex Cloud Functions (если настроен)

---

## Вариант 2: Локальный деплой

Если нужно задеплоить локально, выполните следующие шаги:

### Предварительные требования:

1. **Установите Node.js 18+** (если не установлен):
   ```bash
   # Через Homebrew (macOS)
   brew install node
   
   # Или скачайте с https://nodejs.org/
   ```

2. **Установите Yandex Cloud CLI:**
   ```bash
   curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
   source ~/.bashrc  # или ~/.zshrc
   ```

3. **Настройте YC CLI:**
   ```bash
   yc init
   # Следуйте инструкциям на экране
   ```

4. **Проверьте настройку:**
   ```bash
   yc config list
   ```

### Деплой компонентов:

#### 1. Сборка всех компонентов:

```bash
cd /Users/timitro/Downloads/lug

# Установите зависимости (если еще не установлены)
npm install

# Соберите shared пакет первым
npm run build --workspace=shared

# Соберите все остальные компоненты
npm run build:all
```

#### 2. Деплой Backend:

Backend деплоится через Docker образ в Container Registry. Используйте GitHub Actions или выполните вручную:

```bash
# Убедитесь, что Docker запущен
docker --version

# Войдите в Container Registry
echo "$YC_SERVICE_ACCOUNT_KEY" | docker login \
  --username json_key \
  --password-stdin \
  cr.yandex

# Соберите и запушьте образ
cd backend
docker build -t cr.yandex/YOUR_REGISTRY_ID/lug-date-backend:latest .
docker push cr.yandex/YOUR_REGISTRY_ID/lug-date-backend:latest

# Задеплойте контейнер
yc serverless container revision deploy \
  --container-name=lug-date-backend \
  --image=cr.yandex/YOUR_REGISTRY_ID/lug-date-backend:latest \
  --memory=512m \
  --cores=1 \
  --execution-timeout=30s \
  --service-account-id=YOUR_SERVICE_ACCOUNT_ID \
  --environment NODE_ENV=production \
  --environment CONTAINER_MODE=true \
  --environment TELEGRAM_BOT_TOKEN=YOUR_TOKEN \
  --environment YDB_ENDPOINT=YOUR_ENDPOINT \
  --environment YDB_DATABASE=YOUR_DATABASE \
  --environment YC_SERVICE_ACCOUNT_KEY='YOUR_KEY' \
  --environment YANDEX_STORAGE_BUCKET=YOUR_BUCKET \
  --environment YANDEX_STORAGE_ACCESS_KEY=YOUR_ACCESS_KEY \
  --environment YANDEX_STORAGE_SECRET_KEY=YOUR_SECRET_KEY
```

#### 3. Деплой Frontend:

```bash
# Убедитесь, что frontend собран
ls frontend/dist

# Задеплойте в Object Storage
npm run deploy:frontend
```

**Требуемые переменные окружения:**
- `FRONTEND_STORAGE_BUCKET` или `YANDEX_STORAGE_BUCKET`
- `FRONTEND_STORAGE_ACCESS_KEY` или `YANDEX_STORAGE_ACCESS_KEY`
- `FRONTEND_STORAGE_SECRET_KEY` или `YANDEX_STORAGE_SECRET_KEY`

#### 4. Деплой Admin:

```bash
# Убедитесь, что admin собран
ls admin/dist

# Задеплойте в Object Storage
npm run deploy:admin
```

**Требуемые переменные окружения:**
- `ADMIN_STORAGE_BUCKET` или `YANDEX_STORAGE_BUCKET`
- `ADMIN_STORAGE_ACCESS_KEY` или `YANDEX_STORAGE_ACCESS_KEY`
- `ADMIN_STORAGE_SECRET_KEY` или `YANDEX_STORAGE_SECRET_KEY`
- `BACKEND_URL` (опционально, для обновления config.js)

---

## 🔍 Проверка после деплоя

### Backend Health Check:

```bash
# Получите URL контейнера
yc serverless container get --name=lug-date-backend

# Проверьте health endpoint
curl https://YOUR_CONTAINER_URL/health
```

### Frontend:

```bash
# URL будет показан после деплоя
# Обычно: https://YOUR_BUCKET.website.yandexcloud.net/
```

### Admin:

```bash
# URL будет показан после деплоя
# Обычно: https://YOUR_BUCKET.website.yandexcloud.net/
```

---

## ⚠️ Важные замечания

1. **Секреты**: Все секреты должны быть настроены в GitHub Secrets или в `.env` файле
2. **База данных**: Убедитесь, что миграции выполнены
3. **CORS**: Проверьте настройки `ALLOWED_ORIGINS` и `ADMIN_ORIGINS`
4. **Telegram Bot**: Обновите webhook URL после деплоя backend

---

## 📚 Дополнительная документация

- [GitHub Deploy Quickstart](GITHUB_DEPLOY_QUICKSTART.md)
- [Deploy Instructions](DEPLOY_INSTRUCTIONS.md)
- [System Overview](SYSTEM_OVERVIEW.md)

