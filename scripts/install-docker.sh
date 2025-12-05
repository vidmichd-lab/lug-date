#!/bin/bash

# Скрипт установки Docker Desktop для macOS

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐳 Установка Docker Desktop для macOS...${NC}\n"

# Проверка, установлен ли Docker
if command -v docker &> /dev/null; then
  DOCKER_VERSION=$(docker --version)
  echo -e "${GREEN}✅ Docker уже установлен: $DOCKER_VERSION${NC}"
  exit 0
fi

# Проверка наличия Docker.app в Applications
if [ -d "/Applications/Docker.app" ]; then
  echo -e "${YELLOW}⚠️  Docker.app найден в Applications, но docker не в PATH${NC}"
  echo -e "${YELLOW}Запустите Docker Desktop из Applications${NC}"
  open /Applications/Docker.app
  exit 0
fi

echo -e "${YELLOW}📥 Скачивание Docker Desktop...${NC}"

# Определение архитектуры
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  DOCKER_URL="https://desktop.docker.com/mac/main/arm64/Docker.dmg"
  echo -e "${BLUE}Архитектура: Apple Silicon (arm64)${NC}"
else
  DOCKER_URL="https://desktop.docker.com/mac/main/amd64/Docker.dmg"
  echo -e "${BLUE}Архитектура: Intel (amd64)${NC}"
fi

# Скачивание Docker Desktop
DMG_PATH="/tmp/Docker.dmg"
echo -e "${YELLOW}Скачивание с: $DOCKER_URL${NC}"
curl -L "$DOCKER_URL" -o "$DMG_PATH" --progress-bar

if [ ! -f "$DMG_PATH" ]; then
  echo -e "${RED}❌ Ошибка скачивания Docker Desktop${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Docker Desktop скачан${NC}\n"

# Монтирование DMG
echo -e "${YELLOW}📦 Монтирование образа...${NC}"
MOUNT_POINT=$(hdiutil attach "$DMG_PATH" -nobrowse -noverify -noautoopen | grep -E '^/dev/' | sed 1q | awk '{print $3}')

if [ -z "$MOUNT_POINT" ]; then
  echo -e "${RED}❌ Ошибка монтирования DMG${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Образ смонтирован: $MOUNT_POINT${NC}\n"

# Копирование Docker.app
echo -e "${YELLOW}📋 Копирование Docker.app в Applications...${NC}"
if [ -d "$MOUNT_POINT/Docker.app" ]; then
  cp -R "$MOUNT_POINT/Docker.app" /Applications/ 2>&1 || {
    echo -e "${RED}❌ Ошибка копирования. Попробуйте вручную:${NC}"
    echo -e "${YELLOW}   open $MOUNT_POINT${NC}"
    echo -e "${YELLOW}   Перетащите Docker.app в Applications${NC}"
    hdiutil detach "$MOUNT_POINT" 2>/dev/null || true
    exit 1
  }
  echo -e "${GREEN}✅ Docker.app скопирован${NC}\n"
else
  echo -e "${RED}❌ Docker.app не найден в образе${NC}"
  hdiutil detach "$MOUNT_POINT" 2>/dev/null || true
  exit 1
fi

# Размонтирование
echo -e "${YELLOW}📤 Размонтирование образа...${NC}"
hdiutil detach "$MOUNT_POINT" 2>/dev/null || true
rm -f "$DMG_PATH"

echo -e "${GREEN}✅ Образ размонтирован${NC}\n"

# Запуск Docker Desktop
echo -e "${YELLOW}🚀 Запуск Docker Desktop...${NC}"
open /Applications/Docker.app

echo -e "${GREEN}✅ Docker Desktop запущен${NC}\n"
echo -e "${YELLOW}⏳ Подождите, пока Docker Desktop полностью загрузится...${NC}"
echo -e "${YELLOW}   (обычно 30-60 секунд)${NC}\n"

# Ожидание запуска Docker
echo -e "${BLUE}Ожидание запуска Docker...${NC}"
for i in {1..30}; do
  if docker info &>/dev/null; then
    echo -e "${GREEN}✅ Docker запущен и готов к работе!${NC}\n"
    docker --version
    exit 0
  fi
  echo -n "."
  sleep 2
done

echo -e "\n${YELLOW}⚠️  Docker Desktop запускается. Проверьте статус в меню macOS.${NC}"
echo -e "${YELLOW}   После полной загрузки выполните: docker --version${NC}\n"

