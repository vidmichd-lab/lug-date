#!/bin/bash
# Скрипт для локального запуска миграций
# Использование: ./scripts/run-migrations-locally.sh

set -e

echo "🚀 Локальный запуск миграций базы данных"
echo ""

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
  echo "❌ Файл .env не найден в корне проекта"
  echo "💡 Создайте .env файл со следующими переменными:"
  echo "   YDB_ENDPOINT=grpcs://ydb.serverless.yandexcloud.net:2135"
  echo "   YDB_DATABASE=/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv"
  echo "   YC_SERVICE_ACCOUNT_KEY_FILE=./yc-service-account-key.json"
  echo ""
  exit 1
fi

# Проверяем наличие ключа Service Account
if [ ! -f "yc-service-account-key.json" ]; then
  echo "❌ Файл yc-service-account-key.json не найден"
  echo "💡 Скачайте ключ Service Account из Yandex Cloud Console"
  echo "   https://console.cloud.yandex.ru/iam/service-accounts"
  echo ""
  exit 1
fi

echo "✅ Конфигурация найдена"
echo ""

# Переходим в директорию backend
cd backend

# Устанавливаем зависимости, если нужно
if [ ! -d "node_modules" ]; then
  echo "📦 Установка зависимостей..."
  npm install
fi

# Запускаем миграции
echo "🔄 Запуск миграций..."
npm run migrate

echo ""
echo "✅ Миграции завершены успешно!"

