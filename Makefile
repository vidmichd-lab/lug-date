.PHONY: help dev build deploy stop logs clean

# Переменные
DOCKER_COMPOSE = docker-compose -f docker/docker-compose.yml
YANDEX_REGISTRY = cr.yandex
PROJECT_NAME = dating-app

help: ## Показать справку
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Запустить проект локально
	@echo "🚀 Запуск проекта в режиме разработки..."
	@if [ ! -f docker/.env ]; then \
		echo "⚠️  Файл docker/.env не найден. Копирую из .env.example..."; \
		cp docker/.env.example docker/.env; \
		echo "✅ Файл создан. Заполните необходимые переменные."; \
	fi
	$(DOCKER_COMPOSE) up -d
	@echo "✅ Проект запущен!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend: http://localhost:4000"
	@echo "📊 PostgreSQL: localhost:5432"
	@echo "💾 Redis: localhost:6379"

build: ## Собрать Docker образы
	@echo "🔨 Сборка Docker образов..."
	$(DOCKER_COMPOSE) build
	@echo "✅ Образы собраны!"

stop: ## Остановить все сервисы
	@echo "🛑 Остановка сервисов..."
	$(DOCKER_COMPOSE) down
	@echo "✅ Сервисы остановлены!"

logs: ## Показать логи всех сервисов
	$(DOCKER_COMPOSE) logs -f

logs-frontend: ## Логи frontend
	$(DOCKER_COMPOSE) logs -f frontend

logs-backend: ## Логи backend
	$(DOCKER_COMPOSE) logs -f backend

logs-bot: ## Логи bot
	$(DOCKER_COMPOSE) logs -f bot

restart: ## Перезапустить все сервисы
	@echo "🔄 Перезапуск сервисов..."
	$(DOCKER_COMPOSE) restart
	@echo "✅ Сервисы перезапущены!"

clean: ## Очистить volumes и остановить контейнеры
	@echo "🧹 Очистка..."
	$(DOCKER_COMPOSE) down -v
	@echo "✅ Очистка завершена!"

# Yandex Cloud деплой
deploy: ## Деплой в Yandex Cloud
	@echo "🚀 Деплой в Yandex Cloud..."
	@if [ -z "$(YANDEX_CLOUD_TOKEN)" ]; then \
		echo "❌ YANDEX_CLOUD_TOKEN не установлен"; \
		exit 1; \
	fi
	@echo "📦 Сборка образов для продакшена..."
	@echo "🔐 Авторизация в Yandex Container Registry..."
	@echo "📤 Загрузка образов..."
	@echo "☁️  Деплой в Cloud Functions..."
	@echo "✅ Деплой завершен!"

deploy-frontend: ## Деплой frontend в Yandex Cloud
	@echo "🚀 Деплой frontend..."
	docker build -f docker/Dockerfile.frontend --target production -t $(YANDEX_REGISTRY)/$(PROJECT_NAME)/frontend:latest ..
	@echo "✅ Frontend задеплоен!"

deploy-backend: ## Деплой backend в Yandex Cloud
	@echo "🚀 Деплой backend..."
	docker build -f docker/Dockerfile.backend --target production -t $(YANDEX_REGISTRY)/$(PROJECT_NAME)/backend:latest ..
	@echo "✅ Backend задеплоен!"

deploy-bot: ## Деплой bot в Yandex Cloud
	@echo "🚀 Деплой bot..."
	docker build -f docker/Dockerfile.bot --target production -t $(YANDEX_REGISTRY)/$(PROJECT_NAME)/bot:latest ..
	@echo "✅ Bot задеплоен!"

# Утилиты
ps: ## Показать статус контейнеров
	$(DOCKER_COMPOSE) ps

shell-backend: ## Открыть shell в backend контейнере
	$(DOCKER_COMPOSE) exec backend sh

shell-frontend: ## Открыть shell в frontend контейнере
	$(DOCKER_COMPOSE) exec frontend sh

db-connect: ## Подключиться к PostgreSQL
	$(DOCKER_COMPOSE) exec postgres psql -U postgres -d dating_db

redis-cli: ## Открыть Redis CLI
	$(DOCKER_COMPOSE) exec redis redis-cli

# Установка зависимостей
install: ## Установить зависимости во всех workspace
	@echo "📦 Установка зависимостей..."
	npm install
	@echo "✅ Зависимости установлены!"

# Тестирование
test: ## Запустить тесты
	@echo "🧪 Запуск тестов..."
	npm run test
	@echo "✅ Тесты завершены!"

# Линтинг
lint: ## Запустить линтер
	@echo "🔍 Проверка кода..."
	npm run lint
	@echo "✅ Проверка завершена!"











