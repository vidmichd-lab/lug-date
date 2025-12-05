#!/bin/bash

# Скрипт настройки Homebrew после установки

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🍺 Настройка Homebrew...${NC}\n"

# Поиск Homebrew
if [ -f "/opt/homebrew/bin/brew" ]; then
  BREW_PATH="/opt/homebrew/bin/brew"
  echo -e "${GREEN}✅ Homebrew найден: /opt/homebrew${NC}"
elif [ -f "/usr/local/bin/brew" ]; then
  BREW_PATH="/usr/local/bin/brew"
  echo -e "${GREEN}✅ Homebrew найден: /usr/local${NC}"
else
  echo -e "${YELLOW}⚠️  Homebrew не найден${NC}"
  echo -e "${YELLOW}Убедитесь, что установка завершена${NC}"
  exit 1
fi

# Добавление в PATH
eval "$($BREW_PATH shellenv)"

# Проверка, что уже добавлено в .zprofile
if ! grep -q "brew shellenv" ~/.zprofile 2>/dev/null; then
  if [ -f "/opt/homebrew/bin/brew" ]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  else
    echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
  fi
  echo -e "${GREEN}✅ Homebrew добавлен в ~/.zprofile${NC}"
else
  echo -e "${GREEN}✅ Homebrew уже в ~/.zprofile${NC}"
fi

# Проверка версии
echo -e "\n${BLUE}Версия Homebrew:${NC}"
$BREW_PATH --version

# Обновление Homebrew
echo -e "\n${BLUE}🔄 Обновление Homebrew...${NC}"
$BREW_PATH update

# Установка инструментов
echo -e "\n${BLUE}📦 Установка полезных инструментов...${NC}\n"

TOOLS=("wget" "tree" "htop" "watch" "git-lfs")

for tool in "${TOOLS[@]}"; do
  if command -v "$tool" &>/dev/null; then
    echo -e "${GREEN}✅ $tool уже установлен${NC}"
  else
    echo -e "${YELLOW}📥 Установка $tool...${NC}"
    $BREW_PATH install "$tool" 2>&1 | tail -3 || echo -e "${YELLOW}⚠️  Пропуск $tool${NC}"
  fi
done

# Итоговая проверка
echo -e "\n${BLUE}📋 Итоговая проверка:${NC}\n"

for tool in "${TOOLS[@]}"; do
  if command -v "$tool" &>/dev/null; then
    VERSION=$($tool --version 2>/dev/null | head -1 || echo "installed")
    echo -e "${GREEN}✅ $tool: $VERSION${NC}"
  else
    echo -e "${YELLOW}❌ $tool: не установлен${NC}"
  fi
done

echo -e "\n${GREEN}✨ Настройка завершена!${NC}"
echo -e "${YELLOW}💡 Перезапустите терминал или выполните: source ~/.zprofile${NC}\n"

