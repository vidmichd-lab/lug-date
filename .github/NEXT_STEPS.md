# 🎯 Следующие шаги для автоматического деплоя

## ✅ Что уже сделано

1. ✅ Функции созданы в Yandex Cloud Functions
   - Staging: `dating-app-backend-staging` (ID: d4er75rsvc5mopabt70v)
   - Production: `dating-app-backend-prod` (ID: d4ecebdokiksrq5fkl9b)

2. ✅ GitHub Actions workflow настроен
3. ✅ Serverless handler готов
4. ✅ Все секреты удалены из кода

## 📋 Что нужно сделать СЕЙЧАС

### ШАГ 1: Добавить секреты в GitHub (ОБЯЗАТЕЛЬНО)

**Откройте:** https://github.com/vidmichd-lab/lug-date/settings/secrets/actions

**Добавьте все секреты из списка в `AUTOMATIC_DEPLOY_SETUP.md`**

Минимально необходимые:
- `YC_SERVICE_ACCOUNT_KEY` - JSON ключ сервисного аккаунта
- `YDB_ENDPOINT_DEV`, `YDB_DATABASE_DEV`
- `TELEGRAM_BOT_TOKEN_DEV`
- `YANDEX_STORAGE_*_DEV` (3 секрета)

### ШАГ 2: Разрешить push (если еще не сделано)

Откройте 3 ссылки и нажмите "Allow secret":
- https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36Fzc59uI5R6tff6RwKGLWAKJKO
- https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36Fzc4DycBs7bTwMipKg2k0ie5Y
- https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36FzcApbYN8ZVsxr5zs2w7nlmD9

### ШАГ 3: Запушить код

```bash
git push origin develop
```

После push GitHub Actions автоматически:
- Соберет backend
- Запустит миграции
- Задеплоит в Cloud Functions

### ШАГ 4: Настроить HTTP триггер (после первого деплоя)

После успешного деплоя нужно настроить HTTP триггер:

```bash
# Для staging
yc serverless function create-http-invoker \
  --function-name dating-app-backend-staging \
  --service-account-id <service-account-id>

# Для production
yc serverless function create-http-invoker \
  --function-name dating-app-backend-prod \
  --service-account-id <service-account-id>
```

Или через Yandex Cloud Console:
1. Откройте функцию
2. Перейдите в "Triggers"
3. Создайте HTTP триггер
4. Скопируйте URL триггера

### ШАГ 5: Обновить конфигурацию

После получения URL триггера обновите:
- Админку: `BACKEND_URL=<trigger-url> npm run deploy:admin`
- Frontend: добавьте `VITE_API_URL=<trigger-url>` в `.env`

## 🔍 Проверка

После деплоя проверьте логи:

```bash
yc serverless function logs --name dating-app-backend-staging --limit 50
```

## 📖 Документация

- `AUTOMATIC_DEPLOY_SETUP.md` - полная инструкция
- `.github/BACKEND_SETUP.md` - детальная настройка
- `.github/BACKEND_URLS.md` - URL функций



