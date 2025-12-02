# Быстрый старт: Деплой бекенда

## ✅ Исправления применены

Проблема с экранированием переменных окружения исправлена в `.github/workflows/deploy-backend.yml`.

## 🚀 Варианты деплоя

### Вариант 1: Через GitHub Actions (Рекомендуется)

**Автоматический деплой при push:**
```bash
# Закоммить изменения
git commit -m "Fix backend deployment: proper env variable escaping"

# Запушить в develop или main
git push origin develop  # для staging
# или
git push origin main     # для production
```

**Ручной запуск workflow:**
1. Откройте: https://github.com/vidmichd-lab/lug-date/actions
2. Найдите workflow "Deploy Backend to Yandex Cloud Functions"
3. Нажмите "Run workflow"
4. Выберите ветку (develop для staging, main для production)
5. Нажмите "Run workflow"

### Вариант 2: Локальный деплой (для тестирования)

Если нужно протестировать деплой локально:

```bash
# 1. Убедитесь, что Yandex Cloud CLI установлен и настроен
yc config list

# 2. Соберите проект
npm run build --workspace=shared
npm run build --workspace=backend

# 3. Создайте пакет для деплоя
cd backend
mkdir -p deploy-package
cp -r dist/* deploy-package/
cp -r ../shared/dist deploy-package/shared-dist
cp package.json deploy-package/
cd deploy-package
sed -i.bak 's/"@dating-app\/shared": "\*"/"@dating-app\/shared": "file:.\/shared-dist"/' package.json
rm -f package.json.bak
npm install --production --ignore-scripts
cd ..
zip -r function.zip deploy-package/

# 4. Задеплойте функцию
FUNCTION_ID="d4enks8erf8eentnojj9"
yc serverless function version create \
  --function-id "$FUNCTION_ID" \
  --runtime nodejs18 \
  --entrypoint handler.handler \
  --memory 128m \
  --execution-timeout 30s \
  --source-path function.zip \
  --service-account-id aje0defcl8b2577p01hg \
  --environment "NODE_ENV=development,PORT=8080"
```

## 📋 Что было исправлено

1. **Безопасная передача секретов**: Все секреты теперь передаются через секцию `env` GitHub Actions
2. **Правильное экранирование**: Значения переменных окружения правильно экранируются
3. **Base64 для JSON**: `YC_SERVICE_ACCOUNT_KEY` кодируется в base64 для безопасной передачи

## 🔍 Проверка после деплоя

После успешного деплоя проверьте:

1. **Статус функции:**
   ```bash
   yc serverless function get --id d4enks8erf8eentnojj9
   ```

2. **URL функции:**
   ```
   https://functions.yandexcloud.net/d4enks8erf8eentnojj9
   ```

3. **API Gateway:**
   ```
   https://d5dc4655gjtafu92k0od.yl4tuxdu.apigw.yandexcloud.net
   ```

4. **Health check:**
   ```bash
   curl https://d5dc4655gjtafu92k0od.yl4tuxdu.apigw.yandexcloud.net/health
   ```

## ⚠️ Важные замечания

- Деплой через GitHub Actions автоматически запускается при push в `develop` или `main`
- Для production используйте ветку `main`
- Для staging используйте ветку `develop`
- Убедитесь, что все необходимые секреты настроены в GitHub Actions

## 📝 Следующие шаги

1. Закоммить и запушить изменения
2. Дождаться завершения деплоя в GitHub Actions
3. Проверить работу функции через API Gateway
4. Обновить конфигурацию фронтенда/админки при необходимости

