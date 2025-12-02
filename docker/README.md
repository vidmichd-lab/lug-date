# Docker Configuration

Docker конфигурация для локальной разработки и деплоя в Yandex Cloud.

## 🚀 Быстрый старт

### Локальная разработка

1. Скопируйте `.env.example` в `.env`:

```bash
cp docker/.env.example docker/.env
```

2. Заполните необходимые переменные в `docker/.env`

3. Запустите проект:

```bash
make dev
```

Или напрямую:

```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Доступные сервисы

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📋 Команды Makefile

```bash
make help          # Показать все доступные команды
make dev           # Запустить проект локально
make build         # Собрать Docker образы
make stop          # Остановить все сервисы
make logs          # Показать логи всех сервисов
make logs-frontend # Логи только frontend
make logs-backend  # Логи только backend
make logs-bot      # Логи только bot
make restart       # Перезапустить все сервисы
make clean         # Очистить volumes и остановить контейнеры
make ps            # Показать статус контейнеров
```

### Утилиты

```bash
make shell-backend  # Открыть shell в backend контейнере
make shell-frontend # Открыть shell в frontend контейнере
make db-connect     # Подключиться к PostgreSQL
make redis-cli      # Открыть Redis CLI
```

## 🐳 Docker Compose

### Запуск

```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Логи

```bash
docker-compose -f docker/docker-compose.yml logs -f
```

### Остановка

```bash
docker-compose -f docker/docker-compose.yml down
```

### Пересборка

```bash
docker-compose -f docker/docker-compose.yml build --no-cache
docker-compose -f docker/docker-compose.yml up -d
```

## ☁️ Деплой в Yandex Cloud

### Подготовка

1. Установите Yandex Cloud CLI:

```bash
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
```

2. Авторизуйтесь:

```bash
yc init
```

3. Настройте Container Registry:

```bash
yc container registry create --name dating-registry
```

### Деплой

```bash
# Деплой всех сервисов
make deploy

# Или отдельно
make deploy-frontend
make deploy-backend
make deploy-bot
```

### Переменные окружения для деплоя

Добавьте в `.env`:

```env
YANDEX_CLOUD_TOKEN=ваш_токен
YANDEX_CONTAINER_REGISTRY=cr.yandex/ваш_реестр
YANDEX_CLOUD_FUNCTION_NAME=dating-app
```

## 📁 Структура

```
docker/
├── docker-compose.yml    # Оркестрация всех сервисов
├── Dockerfile.frontend   # Frontend образ
├── Dockerfile.backend    # Backend образ
├── Dockerfile.bot        # Bot образ
├── nginx.conf            # Nginx конфигурация для production
├── init.sql              # Инициализация БД
├── .env.example          # Пример переменных окружения
└── README.md             # Документация
```

## 🔧 Настройка

### Переменные окружения

Все переменные настраиваются в `docker/.env`:

- **Database**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **Backend**: `BACKEND_PORT`, `JWT_SECRET`, `API_URL`
- **Frontend**: `FRONTEND_PORT`, `VITE_API_URL`
- **Telegram**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_NAME`
- **Figma**: `FIGMA_TOKEN`, `FIGMA_FILE_ID`

### Порты

По умолчанию:

- Frontend: `3000`
- Backend: `4000`
- PostgreSQL: `5432`
- Redis: `6379`

Измените в `docker/.env` при необходимости.

## 🐛 Troubleshooting

### Проблемы с портами

Если порты заняты, измените их в `docker/.env`:

```env
FRONTEND_PORT=3001
BACKEND_PORT=4001
POSTGRES_PORT=5433
```

### Очистка данных

Полная очистка (включая volumes):

```bash
make clean
```

### Пересборка образов

```bash
docker-compose -f docker/docker-compose.yml build --no-cache
```

### Просмотр логов

```bash
# Все сервисы
make logs

# Конкретный сервис
make logs-backend
```

## 📚 Дополнительная информация

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Yandex Cloud Container Registry](https://cloud.yandex.ru/docs/container-registry/)
- [Yandex Cloud Functions](https://cloud.yandex.ru/docs/functions/)
