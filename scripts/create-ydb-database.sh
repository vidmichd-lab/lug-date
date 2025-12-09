#!/bin/bash
# Скрипт для создания базы данных YDB через Yandex Cloud CLI
# Использование: ./scripts/create-ydb-database.sh

set -e

echo "🗄️  Создание базы данных YDB"
echo ""

# Проверяем наличие Yandex Cloud CLI
if ! command -v yc &> /dev/null; then
  echo "❌ Yandex Cloud CLI (yc) не установлен"
  echo "💡 Установите: https://cloud.yandex.ru/docs/cli/quickstart"
  exit 1
fi

# Проверяем авторизацию
if ! yc config list &> /dev/null; then
  echo "❌ Не авторизован в Yandex Cloud CLI"
  echo "💡 Выполните: yc init"
  exit 1
fi

# Параметры базы данных
CLOUD_ID="${CLOUD_ID:-b1g6a1tnrohoeas9v0k6}"
FOLDER_ID="${FOLDER_ID:-b1g6rst3sps7hhu8tqla}"
DB_NAME="${DB_NAME:-lug-dating-db}"
DB_ID="${DB_ID:-etnbi9hemleeobirfbrv}"

echo "📋 Параметры:"
echo "   Cloud ID: $CLOUD_ID"
echo "   Folder ID: $FOLDER_ID"
echo "   Database Name: $DB_NAME"
echo "   Database ID: $DB_ID"
echo ""

# Проверяем, существует ли база данных
echo "🔍 Проверка существования базы данных..."
if yc ydb database get --id "$DB_ID" --folder-id "$FOLDER_ID" &> /dev/null; then
  echo "✅ База данных уже существует"
  echo ""
  echo "📊 Информация о базе данных:"
  yc ydb database get --id "$DB_ID" --folder-id "$FOLDER_ID"
  echo ""
  echo "🔗 Endpoint:"
  yc ydb database get --id "$DB_ID" --folder-id "$FOLDER_ID" --format json | jq -r '.endpoint'
  echo ""
  echo "📁 Путь к базе данных:"
  echo "   /ru-central1/$CLOUD_ID/$DB_ID"
else
  echo "❌ База данных не найдена"
  echo ""
  echo "💡 Создайте базу данных через:"
  echo "   1. Yandex Cloud Console: https://console.cloud.yandex.ru/folders/$FOLDER_ID/ydb"
  echo "   2. Или выполните команду:"
  echo "      yc ydb database create --name $DB_NAME --folder-id $FOLDER_ID --serverless"
  echo ""
fi

