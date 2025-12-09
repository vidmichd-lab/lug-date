#!/bin/bash
# Скрипт для назначения роли YDB Editor сервисному аккаунту на базе данных

set -e

SERVICE_ACCOUNT_ID="ajealt724899jtugjv6k"
DATABASE_ID="etnbi9hemleeobirfbrv"
FOLDER_ID="b1g6a1tnrohoeas9v0k6"
ROLE="ydb.editor"

echo "🔐 Назначение роли YDB Editor сервисному аккаунту..."
echo ""
echo "Service Account ID: $SERVICE_ACCOUNT_ID"
echo "Database ID: $DATABASE_ID"
echo "Folder ID: $FOLDER_ID"
echo "Role: $ROLE"
echo ""

# Проверяем, установлен ли YC CLI
if ! command -v yc &> /dev/null; then
  echo "❌ ERROR: YC CLI is not installed"
  echo "   Install: https://cloud.yandex.ru/docs/cli/quickstart"
  exit 1
fi

# Проверяем существование базы данных
echo "📊 Checking database existence..."
DB_EXISTS=$(yc ydb database get "$DATABASE_ID" --folder-id "$FOLDER_ID" --format json 2>&1 | jq -e '.id' > /dev/null 2>&1 && echo "yes" || echo "no")

if [ "$DB_EXISTS" = "no" ]; then
  echo "❌ ERROR: Database not found"
  echo "   Database ID: $DATABASE_ID"
  echo "   Folder ID: $FOLDER_ID"
  echo ""
  echo "💡 Available databases:"
  yc ydb database list --folder-id "$FOLDER_ID" --format json | jq -r '.[] | "   - \(.name) (ID: \(.id))"'
  exit 1
fi

echo "✅ Database found"
echo ""

# Проверяем текущие роли
echo "🔍 Checking current roles..."
CURRENT_ROLES=$(yc ydb database get "$DATABASE_ID" --folder-id "$FOLDER_ID" --format json 2>&1 | jq -r ".access.bindings[]? | select(.subject.id == \"$SERVICE_ACCOUNT_ID\") | .role_id" || echo "")

if [ -n "$CURRENT_ROLES" ]; then
  echo "✅ Service Account already has roles:"
  echo "$CURRENT_ROLES" | while read -r role; do
    echo "   - $role"
  done
  echo ""
  
  if echo "$CURRENT_ROLES" | grep -q "$ROLE"; then
    echo "✅ Role $ROLE already assigned. No action needed."
    exit 0
  fi
fi

# Назначаем роль
echo "🔧 Assigning role $ROLE..."
yc ydb database add-access-binding "$DATABASE_ID" \
  --folder-id "$FOLDER_ID" \
  --subject serviceAccount:"$SERVICE_ACCOUNT_ID" \
  --role "$ROLE"

echo ""
echo "✅ Role assigned successfully!"
echo ""
echo "📋 Verification:"
yc ydb database get "$DATABASE_ID" --folder-id "$FOLDER_ID" --format json | jq -r ".access.bindings[]? | select(.subject.id == \"$SERVICE_ACCOUNT_ID\") | \"   - \(.role_id)\""

