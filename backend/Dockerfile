FROM node:18-alpine

WORKDIR /app

# Копировать код
COPY backend/dist ./dist
COPY backend/package.json ./
COPY backend/package-lock.json* ./
COPY shared/dist ./shared-dist

# Обновить ссылку на shared пакет
RUN sed -i.bak 's|"@dating-app/shared": "\*"|"@dating-app/shared": "file:./shared-dist"|' package.json && rm package.json.bak

# Установить зависимости только production
RUN npm install --production --ignore-scripts

# Entrypoint для Cloud Functions
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
