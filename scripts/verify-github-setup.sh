#!/bin/bash

# Скрипт для проверки настройки GitHub для деплоя
# Использование: ./scripts/verify-github-setup.sh

set -e

REPO="vidmichd-lab/lug-date"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Проверка настройки GitHub для репозитория: $REPO"
echo ""

# Проверка наличия GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI не установлен. Установите: brew install gh${NC}"
    echo -e "${YELLOW}   Или проверьте вручную: https://github.com/$REPO/settings${NC}"
    echo ""
    echo "📋 Чеклист для ручной проверки:"
    echo "   1. Secrets: https://github.com/$REPO/settings/secrets/actions"
    echo "      - [ ] YC_SERVICE_ACCOUNT_KEY должен быть создан"
    echo ""
    echo "   2. Environments: https://github.com/$REPO/settings/environments"
    echo "      - [ ] staging должен быть создан"
    echo "      - [ ] production должен быть создан"
    exit 0
fi

# Проверка авторизации в GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Не авторизован в GitHub CLI${NC}"
    echo "   Выполните: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI установлен и авторизован"
echo ""

# Проверка workflow файла
echo "📄 Проверка workflow файла..."
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo -e "${RED}❌ Файл .github/workflows/deploy.yml не найден${NC}"
    exit 1
fi

# Проверка использования environments в workflow
if grep -q "environment:" .github/workflows/deploy.yml; then
    echo -e "${GREEN}✅ Workflow использует environments${NC}"
else
    echo -e "${RED}❌ Workflow не использует environments${NC}"
fi

# Проверка использования secrets в workflow
if grep -q "YC_SERVICE_ACCOUNT_KEY" .github/workflows/deploy.yml; then
    echo -e "${GREEN}✅ Workflow использует YC_SERVICE_ACCOUNT_KEY${NC}"
else
    echo -e "${RED}❌ Workflow не использует YC_SERVICE_ACCOUNT_KEY${NC}"
fi

echo ""

# Проверка secrets через GitHub API
echo "🔐 Проверка Secrets..."
SECRETS=$(gh secret list --repo "$REPO" 2>/dev/null || echo "")

if echo "$SECRETS" | grep -q "YC_SERVICE_ACCOUNT_KEY"; then
    echo -e "${GREEN}✅ Secret YC_SERVICE_ACCOUNT_KEY найден${NC}"
else
    echo -e "${RED}❌ Secret YC_SERVICE_ACCOUNT_KEY не найден${NC}"
    echo "   Создайте его здесь: https://github.com/$REPO/settings/secrets/actions"
fi

echo ""

# Проверка environments через GitHub API
echo "🌍 Проверка Environments..."
ENVIRONMENTS=$(gh api "repos/$REPO/environments" 2>/dev/null || echo "[]")

if echo "$ENVIRONMENTS" | grep -q '"name":"staging"'; then
    echo -e "${GREEN}✅ Environment 'staging' найден${NC}"
else
    echo -e "${RED}❌ Environment 'staging' не найден${NC}"
    echo "   Создайте его здесь: https://github.com/$REPO/settings/environments"
fi

if echo "$ENVIRONMENTS" | grep -q '"name":"production"'; then
    echo -e "${GREEN}✅ Environment 'production' найден${NC}"
else
    echo -e "${RED}❌ Environment 'production' не найден${NC}"
    echo "   Создайте его здесь: https://github.com/$REPO/settings/environments"
fi

echo ""
echo "📖 Подробная инструкция: docs/GITHUB_SETUP.md"











