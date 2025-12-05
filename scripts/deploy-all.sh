#!/bin/bash

# Скрипт для деплоя всех компонентов на Yandex Cloud
# Использование: ./scripts/deploy-all.sh [--skip-build] [--skip-backend] [--skip-frontend] [--skip-admin]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Флаги
SKIP_BUILD=false
SKIP_BACKEND=false
SKIP_FRONTEND=false
SKIP_ADMIN=false

# Парсинг аргументов
for arg in "$@"; do
  case $arg in
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-backend)
      SKIP_BACKEND=true
      shift
      ;;
    --skip-frontend)
      SKIP_FRONTEND=true
      shift
      ;;
    --skip-admin)
      SKIP_ADMIN=true
      shift
      ;;
    *)
      echo -e "${YELLOW}Unknown option: $arg${NC}"
      ;;
  esac
done

echo -e "${GREEN}🚀 Начинаем деплой на Yandex Cloud...${NC}\n"

# Проверка Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js не найден в PATH${NC}"
  echo -e "${YELLOW}Установите Node.js: https://nodejs.org/${NC}"
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

# Проверка npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm не найден в PATH${NC}"
  exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}\n"

# Переход в корневую директорию проекта
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)
echo -e "${GREEN}📁 Проект: $PROJECT_ROOT${NC}\n"

# Сборка
if [ "$SKIP_BUILD" = false ]; then
  echo -e "${GREEN}🔨 Сборка проекта...${NC}"
  
  # Установка зависимостей
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
    npm install
  fi
  
  # Сборка shared пакета
  echo -e "${YELLOW}📦 Сборка shared пакета...${NC}"
  npm run build --workspace=shared || {
    echo -e "${RED}❌ Ошибка сборки shared пакета${NC}"
    exit 1
  }
  
  # Сборка всех компонентов
  echo -e "${YELLOW}📦 Сборка всех компонентов...${NC}"
  npm run build:all || {
    echo -e "${RED}❌ Ошибка сборки компонентов${NC}"
    exit 1
  }
  
  echo -e "${GREEN}✅ Сборка завершена${NC}\n"
else
  echo -e "${YELLOW}⏭️  Пропуск сборки${NC}\n"
fi

# Деплой Backend
if [ "$SKIP_BACKEND" = false ]; then
  echo -e "${GREEN}🔧 Деплой Backend...${NC}"
  
  # Проверка наличия dist
  if [ ! -d "backend/dist" ]; then
    echo -e "${RED}❌ backend/dist не найден. Выполните сборку сначала.${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}⚠️  Backend деплоится через GitHub Actions или вручную через Docker${NC}"
  echo -e "${YELLOW}Для локального деплоя используйте:${NC}"
  echo -e "${YELLOW}  docker build -t cr.yandex/YOUR_REGISTRY/lug-date-backend:latest -f backend/Dockerfile .${NC}"
  echo -e "${YELLOW}  docker push cr.yandex/YOUR_REGISTRY/lug-date-backend:latest${NC}\n"
else
  echo -e "${YELLOW}⏭️  Пропуск деплоя Backend${NC}\n"
fi

# Деплой Frontend
if [ "$SKIP_FRONTEND" = false ]; then
  echo -e "${GREEN}📱 Деплой Frontend...${NC}"
  
  # Проверка наличия dist
  if [ ! -d "frontend/dist" ]; then
    echo -e "${RED}❌ frontend/dist не найден. Выполните сборку сначала.${NC}"
    exit 1
  fi
  
  # Проверка переменных окружения
  if [ -z "$FRONTEND_STORAGE_BUCKET" ] && [ -z "$YANDEX_STORAGE_BUCKET" ]; then
    echo -e "${RED}❌ FRONTEND_STORAGE_BUCKET или YANDEX_STORAGE_BUCKET не установлен${NC}"
    echo -e "${YELLOW}Установите переменные окружения перед деплоем${NC}"
    exit 1
  fi
  
  npm run deploy:frontend || {
    echo -e "${RED}❌ Ошибка деплоя Frontend${NC}"
    exit 1
  }
  
  echo -e "${GREEN}✅ Frontend задеплоен${NC}\n"
else
  echo -e "${YELLOW}⏭️  Пропуск деплоя Frontend${NC}\n"
fi

# Деплой Admin
if [ "$SKIP_ADMIN" = false ]; then
  echo -e "${GREEN}👨‍💼 Деплой Admin...${NC}"
  
  # Проверка наличия dist
  if [ ! -d "admin/dist" ]; then
    echo -e "${RED}❌ admin/dist не найден. Выполните сборку сначала.${NC}"
    exit 1
  fi
  
  # Проверка переменных окружения
  if [ -z "$ADMIN_STORAGE_BUCKET" ] && [ -z "$YANDEX_STORAGE_BUCKET" ]; then
    echo -e "${RED}❌ ADMIN_STORAGE_BUCKET или YANDEX_STORAGE_BUCKET не установлен${NC}"
    echo -e "${YELLOW}Установите переменные окружения перед деплоем${NC}"
    exit 1
  fi
  
  npm run deploy:admin || {
    echo -e "${RED}❌ Ошибка деплоя Admin${NC}"
    exit 1
  }
  
  echo -e "${GREEN}✅ Admin задеплоен${NC}\n"
else
  echo -e "${YELLOW}⏭️  Пропуск деплоя Admin${NC}\n"
fi

echo -e "${GREEN}✨ Деплой завершен!${NC}"
echo -e "${YELLOW}Проверьте статус деплоя в Yandex Cloud Console${NC}"

