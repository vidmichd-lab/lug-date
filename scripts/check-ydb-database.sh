#!/bin/bash
# Скрипт для проверки существования базы данных YDB и прав Service Account

set -e

echo "🔍 Проверка базы данных YDB..."
echo ""

# Проверяем наличие необходимых переменных
if [ -z "$YDB_DATABASE" ]; then
  echo "❌ ERROR: YDB_DATABASE is not set"
  exit 1
fi

if [ -z "$YC_SERVICE_ACCOUNT_KEY" ]; then
  echo "❌ ERROR: YC_SERVICE_ACCOUNT_KEY is not set"
  exit 1
fi

# Извлекаем folder ID и database ID из пути
if [[ "$YDB_DATABASE" =~ ^/ru-central1/([^/]+)/(.+)$ ]]; then
  FOLDER_ID="${BASH_REMATCH[1]}"
  DB_ID="${BASH_REMATCH[2]}"
  echo "📁 Folder ID: $FOLDER_ID"
  echo "🗄️  Database ID: $DB_ID"
  echo ""
else
  echo "❌ ERROR: Invalid database path format. Should be: /ru-central1/<folder-id>/<database-id>"
  exit 1
fi

# Сохраняем Service Account key во временный файл
TEMP_KEY_FILE=$(mktemp)
echo "$YC_SERVICE_ACCOUNT_KEY" > "$TEMP_KEY_FILE"
chmod 600 "$TEMP_KEY_FILE"

# Устанавливаем переменную окружения для YC CLI
export YC_SERVICE_ACCOUNT_KEY_FILE="$TEMP_KEY_FILE"

echo "🔐 Проверка Service Account key..."
if [ ! -f "$YC_SERVICE_ACCOUNT_KEY_FILE" ]; then
  echo "❌ ERROR: Service Account key file not found"
  exit 1
fi

# Проверяем, что ключ валидный JSON
if ! jq -e . "$YC_SERVICE_ACCOUNT_KEY_FILE" > /dev/null 2>&1; then
  echo "❌ ERROR: Service Account key is not valid JSON"
  exit 1
fi

SERVICE_ACCOUNT_ID=$(jq -r '.service_account_id' "$YC_SERVICE_ACCOUNT_KEY_FILE")
echo "✅ Service Account ID: $SERVICE_ACCOUNT_ID"
echo ""

echo "🔍 Проверка базы данных через YC CLI..."
echo ""

# Проверяем, установлен ли YC CLI
if ! command -v yc &> /dev/null; then
  echo "⚠️  WARNING: YC CLI is not installed. Skipping database check."
  echo "   Install YC CLI: https://cloud.yandex.ru/docs/cli/quickstart"
  echo ""
  echo "📋 Manual check steps:"
  echo "   1. Open Yandex Cloud Console: https://console.cloud.yandex.ru/folders/$FOLDER_ID/ydb"
  echo "   2. Check if database with ID '$DB_ID' exists"
  echo "   3. Verify Service Account '$SERVICE_ACCOUNT_ID' has 'YDB Editor' role"
  exit 0
fi

# Устанавливаем folder-id для YC CLI
yc config set folder-id "$FOLDER_ID"

# Проверяем существование базы данных
echo "📊 Checking database existence..."
DB_LIST=$(yc ydb database list --folder-id "$FOLDER_ID" --format json 2>&1 || echo "[]")

if echo "$DB_LIST" | jq -e ".[] | select(.id == \"$DB_ID\")" > /dev/null 2>&1; then
  echo "✅ Database found in Yandex Cloud"
  DB_NAME=$(echo "$DB_LIST" | jq -r ".[] | select(.id == \"$DB_ID\") | .name")
  echo "   Name: $DB_NAME"
  echo "   ID: $DB_ID"
  echo "   Path: $YDB_DATABASE"
else
  echo "❌ Database NOT found in Yandex Cloud"
  echo "   Expected ID: $DB_ID"
  echo "   Expected path: $YDB_DATABASE"
  echo ""
  echo "💡 Available databases in folder $FOLDER_ID:"
  echo "$DB_LIST" | jq -r '.[] | "   - \(.name) (ID: \(.id), Path: \(.database_path))"' || echo "   (none found)"
  echo ""
  echo "🔧 To create a database:"
  echo "   1. Open: https://console.cloud.yandex.ru/folders/$FOLDER_ID/ydb"
  echo "   2. Click 'Create database'"
  echo "   3. Choose 'Serverless' mode"
  echo "   4. Copy the database path after creation"
  exit 1
fi

echo ""
echo "🔐 Checking Service Account permissions..."
echo ""

# Проверяем роли Service Account
SA_ROLES=$(yc iam service-account get "$SERVICE_ACCOUNT_ID" --format json 2>&1 || echo "{}")

if echo "$SA_ROLES" | jq -e '.id' > /dev/null 2>&1; then
  echo "✅ Service Account found: $SERVICE_ACCOUNT_ID"
  echo ""
  echo "📋 Checking roles on database..."
  
  # Проверяем роли на базе данных
  DB_ROLES=$(yc ydb database get "$DB_ID" --format json 2>&1 | jq -r '.access.bindings[]? | select(.subject.id == "'"$SERVICE_ACCOUNT_ID"'") | .role_id' || echo "")
  
  if [ -n "$DB_ROLES" ]; then
    echo "✅ Service Account has roles on database:"
    echo "$DB_ROLES" | while read -r role; do
      echo "   - $role"
    done
  else
    echo "❌ Service Account does NOT have roles on database"
    echo ""
    echo "🔧 To assign role:"
    echo "   1. Open: https://console.cloud.yandex.ru/folders/$FOLDER_ID/ydb/$DB_ID"
    echo "   2. Go to 'Access' tab"
    echo "   3. Click 'Assign roles'"
    echo "   4. Select Service Account: $SERVICE_ACCOUNT_ID"
    echo "   5. Choose role: 'YDB Editor' or 'YDB Admin'"
    echo "   6. Save"
  fi
  
  echo ""
  echo "📋 Checking roles on folder..."
  
  # Проверяем роли на каталоге
  FOLDER_ROLES=$(yc resource-manager folder get "$FOLDER_ID" --format json 2>&1 | jq -r '.access.bindings[]? | select(.subject.id == "'"$SERVICE_ACCOUNT_ID"'") | .role_id' || echo "")
  
  if [ -n "$FOLDER_ROLES" ]; then
    echo "✅ Service Account has roles on folder:"
    echo "$FOLDER_ROLES" | while read -r role; do
      echo "   - $role"
    done
  else
    echo "⚠️  Service Account does NOT have roles on folder"
    echo "   (This is OK if roles are assigned directly on database)"
  fi
else
  echo "❌ Service Account NOT found: $SERVICE_ACCOUNT_ID"
  echo ""
  echo "💡 Check Service Account key is correct"
fi

# Очистка
rm -f "$TEMP_KEY_FILE"

echo ""
echo "✅ Check complete!"

