#!/bin/bash

# Скрипт установки всех необходимых инструментов для разработки

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🛠️  Установка всех необходимых инструментов...${NC}\n"

# Функция для проверки и установки Homebrew
install_homebrew() {
  if command -v brew &> /dev/null; then
    echo -e "${GREEN}✅ Homebrew уже установлен${NC}"
    eval "$(brew shellenv)"
    return 0
  fi

  echo -e "${YELLOW}📦 Установка Homebrew...${NC}"
  
  # Определение пути для Homebrew
  if [ "$(uname -m)" = "arm64" ]; then
    BREW_PATH="/opt/homebrew/bin/brew"
  else
    BREW_PATH="/usr/local/bin/brew"
  fi

  # Проверка, установлен ли Homebrew, но не в PATH
  if [ -f "$BREW_PATH" ]; then
    echo -e "${GREEN}✅ Homebrew найден, добавляю в PATH...${NC}"
    eval "$($BREW_PATH shellenv)"
    echo "$($BREW_PATH shellenv)" >> ~/.zprofile
    return 0
  fi

  # Установка Homebrew
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" < /dev/null || {
    echo -e "${RED}❌ Ошибка установки Homebrew${NC}"
    echo -e "${YELLOW}⚠️  Может потребоваться ввод пароля администратора${NC}"
    return 1
  }

  # Добавление в PATH
  if [ -f "/opt/homebrew/bin/brew" ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  elif [ -f "/usr/local/bin/brew" ]; then
    eval "$(/usr/local/bin/brew shellenv)"
    echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
  fi

  echo -e "${GREEN}✅ Homebrew установлен${NC}"
}

# Функция установки инструментов через Homebrew
install_brew_tools() {
  if ! command -v brew &> /dev/null; then
    echo -e "${RED}❌ Homebrew не установлен${NC}"
    return 1
  fi

  eval "$(brew shellenv)"

  echo -e "${BLUE}📦 Установка полезных инструментов через Homebrew...${NC}\n"

  # Обновление Homebrew
  echo -e "${YELLOW}🔄 Обновление Homebrew...${NC}"
  brew update || true

  # Установка базовых инструментов
  TOOLS=(
    "wget"
    "curl"  # обычно уже установлен
    "jq"    # JSON processor
    "tree"  # directory tree
    "htop"  # better top
    "watch" # execute periodically
  )

  for tool in "${TOOLS[@]}"; do
    if command -v "$tool" &> /dev/null; then
      echo -e "${GREEN}✅ $tool уже установлен${NC}"
    else
      echo -e "${YELLOW}📥 Установка $tool...${NC}"
      brew install "$tool" 2>&1 | tail -3 || echo -e "${YELLOW}⚠️  Пропуск $tool${NC}"
    fi
  done

  # Установка GUI приложений (опционально)
  CASKS=(
    "visual-studio-code"  # VS Code
    "iterm2"              # Better terminal
    "postman"             # API testing
  )

  echo -e "\n${BLUE}📱 Установка GUI приложений (опционально)...${NC}"
  read -p "Установить GUI приложения? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    for cask in "${CASKS[@]}"; do
      if brew list --cask "$cask" &>/dev/null; then
        echo -e "${GREEN}✅ $cask уже установлен${NC}"
      else
        echo -e "${YELLOW}📥 Установка $cask...${NC}"
        brew install --cask "$cask" 2>&1 | tail -3 || echo -e "${YELLOW}⚠️  Пропуск $cask${NC}"
      fi
    done
  fi
}

# Основная функция
main() {
  # Установка Homebrew
  install_homebrew

  # Установка инструментов
  if command -v brew &> /dev/null; then
    install_brew_tools
  fi

  # Итоговая проверка
  echo -e "\n${BLUE}📋 Итоговая проверка установленных инструментов:${NC}\n"

  TOOLS_CHECK=("brew" "wget" "curl" "jq" "tree" "htop" "watch")
  for tool in "${TOOLS_CHECK[@]}"; do
    if command -v "$tool" &> /dev/null; then
      VERSION=$($tool --version 2>/dev/null | head -1 || echo "installed")
      echo -e "${GREEN}✅ $tool: $VERSION${NC}"
    else
      echo -e "${RED}❌ $tool: не установлен${NC}"
    fi
  done

  echo -e "\n${GREEN}✨ Установка завершена!${NC}"
  echo -e "${YELLOW}💡 Перезапустите терминал или выполните: source ~/.zprofile${NC}\n"
}

main

