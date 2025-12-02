# Инструкции по деплою бекенда

## Проблема

Архив функции слишком большой (33MB), лимит Yandex Cloud Functions - 3.5MB.

## Решения

### Вариант 1: GitHub Actions (Рекомендуется)

GitHub Actions автоматически правильно упаковывает зависимости:

1. **Запустите workflow вручную:**
   - Откройте: https://github.com/vidmichd-lab/lug-date/actions
   - Найдите workflow "Deploy Backend to Yandex Cloud Functions"
   - Нажмите "Run workflow"
   - Выберите ветку (develop или main)

2. **Или сделайте commit и push:**
   ```bash
   git add backend/
   git commit -m "Update backend"
   git push
   ```

### Вариант 2: Использовать Docker образ

Создайте Dockerfile и используйте Container Registry:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/dist ./dist
COPY backend/package.json ./
RUN npm install --production
CMD ["node", "dist/handler.js"]
```

Затем:
```bash
yc container image build --tag cr.yandex/<registry-id>/dating-app-backend:latest .
yc serverless function version create \
  --function-id d4enks8erf8eentnojj9 \
  --runtime container \
  --image cr.yandex/<registry-id>/dating-app-backend:latest
```

### Вариант 3: Уменьшить размер архива

Исключить ненужные файлы из node_modules:

```bash
cd backend/deploy-package
# Удалить документацию, тесты, исходники
find node_modules -type f \( -name "*.md" -o -name "*.txt" -o -name "*.map" -o -name "*.ts" \) -delete
find node_modules -type d \( -name "test" -o -name "tests" -o -name "docs" \) -exec rm -rf {} +
# Пересоздать архив
cd ..
zip -r function.zip deploy-package/
```

Но даже после очистки архив может быть больше 3.5MB.

## Текущий статус

- ✅ Код собран
- ✅ Зависимости установлены
- ✅ Архив создан (33MB)
- ❌ Архив слишком большой для прямого деплоя
- ✅ Архив загружен в Object Storage: `s3://lug-admin-deploy/function.zip`

## Рекомендация

**Используйте GitHub Actions** - это самый надежный способ деплоя, который правильно обрабатывает все зависимости и монорепозиторий.
