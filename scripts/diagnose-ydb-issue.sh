#!/bin/bash
# Диагностика проблемы с YDB

echo "🔍 Диагностика проблемы 'Database not found'"
echo ""

# Проверяем базу данных
echo "1. Информация о базе данных:"
yc ydb database get --id etnbi9hemleeobirfbrv --folder-id b1g6rst3sps7hhu8tqla --format json | jq -r '
  "   ID: \(.id)",
  "   Name: \(.name)",
  "   Status: \(.status)",
  "   Endpoint: \(.endpoint)",
  "   Database Path: \(.databasePath // "null")",
  "   Folder ID: \(.folderId // "null")"
'
echo ""

# Проверяем права Service Account
echo "2. Права Service Account (ajealt724899jtugjv6k) на базе данных:"
yc ydb database list-access-bindings --id etnbi9hemleeobirfbrv --folder-id b1g6rst3sps7hhu8tqla 2>&1 | grep ajealt724899jtugjv6k || echo "   ❌ Права не найдены"
echo ""

# Проверяем права на каталоге
echo "3. Права Service Account на каталоге:"
yc resource-manager folder list-access-bindings --id b1g6rst3sps7hhu8tqla 2>&1 | grep ajealt724899jtugjv6k | head -3
echo ""

# Рекомендации
echo "💡 Рекомендации:"
echo "   1. Откройте Yandex Cloud Console:"
echo "      https://console.cloud.yandex.ru/folders/b1g6rst3sps7hhu8tqla/ydb"
echo ""
echo "   2. Выберите базу данных 'dating-app-db-prod'"
echo ""
echo "   3. Попробуйте выполнить запрос через Query Editor:"
echo "      SELECT 1 as test;"
echo ""
echo "   4. Если Query Editor работает, проблема в коде подключения"
echo "   5. Если Query Editor не работает, проблема в правах или конфигурации базы данных"
