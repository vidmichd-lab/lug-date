#!/bin/bash

# Скрипт установки всех необходимых инструментов для деплоя
# Запустите с правами администратора: sudo ./scripts/install-tools.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Установка инструментов для деплоя на Yandex Cloud${NC}\n"

# Проверка прав администратора
if [ "$EUID" -ne 0 ] && [ "$(id -u)" -ne 0 ]; then
  echo -e "${YELLOW}⚠️  Для установки некоторых инструментов требуются права администратора${NC}"
  echo -e "${YELLOW}Запустите скрипт с sudo: sudo ./scripts/install-tools.sh${NC}\n"
fi

# 1. Установка Homebrew
echo -e "${GREEN}1️⃣  Проверка Homebrew...${NC}"
if ! command -v brew &> /dev/null; then
  echo -e "${YELLOW}   Homebrew не найден. Установка...${NC}"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  
  # Добавление Homebrew в PATH для Apple Silicon
  if [ -f "/opt/homebrew/bin/brew" ]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
  # Для Intel Mac
  elif [ -f "/usr/local/bin/brew" ]; then
    echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/usr/local/bin/brew shellenv)"
  fi
  echo -e "${GREEN}   ✅ Homebrew установлен${NC}\n"
else
  echo -e "${GREEN}   ✅ Homebrew уже установлен${NC}\n"
fi

# 2. Установка Node.js
echo -e "${GREEN}2️⃣  Проверка Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}   Node.js не найден. Установка через Homebrew...${NC}"
  brew install node
  echo -e "${GREEN}   ✅ Node.js установлен${NC}\n"
else
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}   ✅ Node.js уже установлен: $NODE_VERSION${NC}\n"
fi

# 3. Проверка npm
echo -e "${GREEN}3️⃣  Проверка npm...${NC}"
if ! command -v npm &> /dev/null; then
  echo -e "${RED}   ❌ npm не найден, хотя Node.js установлен${NC}"
  echo -e "${YELLOW}   Переустановите Node.js${NC}\n"
else
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}   ✅ npm установлен: $NPM_VERSION${NC}\n"
fi

# 4. Установка Docker
echo -e "${GREEN}4️⃣  Проверка Docker...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}   Docker не найден.${NC}"
  echo -e "${YELLOW}   Установите Docker Desktop: https://www.docker.com/products/docker-desktop${NC}"
  echo -e "${YELLOW}   Или через Homebrew: brew install --cask docker${NC}\n"
  
  # Попытка установки через Homebrew
  if command -v brew &> /dev/null; then
    read -p "Установить Docker через Homebrew? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      brew install --cask docker
      echo -e "${GREEN}   ✅ Docker установлен${NC}"
      echo -e "${YELLOW}   ⚠️  Запустите Docker Desktop из Applications${NC}\n"
    fi
  fi
else
  DOCKER_VERSION=$(docker --version)
  echo -e "${GREEN}   ✅ Docker установлен: $DOCKER_VERSION${NC}\n"
fi

# 5. Установка Yandex Cloud CLI
echo -e "${GREEN}5️⃣  Проверка Yandex Cloud CLI...${NC}"
if ! command -v yc &> /dev/null; then
  echo -e "${YELLOW}   Yandex Cloud CLI не найден. Установка...${NC}"
  
  # Создание директории для YC CLI
  mkdir -p ~/yandex-cloud
  
  # Скачивание и установка
  curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
  
  # Добавление в PATH
  if [ -f "$HOME/yandex-cloud/bin/yc" ]; then
    echo 'export PATH=$PATH:$HOME/yandex-cloud/bin' >> ~/.zprofile
    export PATH=$PATH:$HOME/yandex-cloud/bin
    echo -e "${GREEN}   ✅ Yandex Cloud CLI установлен${NC}\n"
  else
    echo -e "${RED}   ❌ Ошибка установки Yandex Cloud CLI${NC}\n"
  fi
else
  YC_VERSION=$(yc version 2>/dev/null || echo "installed")
  echo -e "${GREEN}   ✅ Yandex Cloud CLI уже установлен${NC}\n"
fi

# Итоговая проверка
echo -e "${BLUE}📋 Итоговая проверка установленных инструментов:${NC}\n"

TOOLS=("node" "npm" "git" "docker" "yc")
ALL_OK=true

for tool in "${TOOLS[@]}"; do
  if command -v $tool &> /dev/null; then
    VERSION=$($tool --version 2>/dev/null || $tool version 2>/dev/null || echo "installed")
    echo -e "${GREEN}✅ $tool: $VERSION${NC}"
  else
    echo -e "${RED}❌ $tool: не установлен${NC}"
    ALL_OK=false
  fi
done

echo ""

if [ "$ALL_OK" = true ]; then
  echo -e "${GREEN}✨ Все инструменты установлены!${NC}\n"
  echo -e "${BLUE}Следующие шаги:${NC}"
  echo -e "1. Перезапустите терминал или выполните: source ~/.zprofile"
  echo -e "2. Настройте Yandex Cloud CLI: yc init"
  echo -e "3. Запустите деплой: ./scripts/deploy-all.sh\n"
else
  echo -e "${YELLOW}⚠️  Некоторые инструменты не установлены${NC}"
  echo -e "${YELLOW}Установите их вручную и повторите проверку${NC}\n"
fi

