# Multi-stage build для уменьшения размера
FROM node:20-alpine AS builder

WORKDIR /build

# Копируем package files для кэширования слоёв
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci

# Копируем исходники
# tsconfig.json уже включен в backend/ и shared/ директории
COPY backend ./backend
COPY shared ./shared

# Собираем TypeScript
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend

# Production stage
FROM node:20-alpine

WORKDIR /function

# Копируем только package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Устанавливаем только production зависимости
# Отключаем prepare скрипт (husky не нужен в Docker и требует .git)
RUN npm ci --only=production --omit=dev --ignore-scripts && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/*

# Копируем собранный код из builder
COPY --from=builder /build/backend/dist ./backend/dist
COPY --from=builder /build/shared/dist ./shared/dist

# Обновляем ссылку на shared пакет в package.json
# Структура: /function/backend и /function/shared
RUN sed -i.bak 's|"@dating-app/shared": "\*"|"@dating-app/shared": "file:../shared/dist"|' backend/package.json && \
    rm -f backend/package.json.bak && \
    # Удаляем ненужные файлы для уменьшения размера
    find . -name "*.map" -delete && \
    find . -name "*.ts" -not -path "*/node_modules/*" -delete && \
    find . -name "*.tsx" -not -path "*/node_modules/*" -delete && \
    find . -name "tsconfig.json" -delete && \
    rm -rf /tmp/* /var/tmp/*

# Копируем service account key (будет монтироваться в runtime)
RUN mkdir -p /function/keys

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /function/backend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 8080

# Запуск приложения
CMD ["node", "dist/index.js"]
