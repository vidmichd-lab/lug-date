# Dockerfile for Yandex Cloud Functions
# Optimized for serverless deployment
# Build from project root: docker build -f backend/Dockerfile .

FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Copy package files from project root
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install dependencies (production only)
RUN npm ci --workspace=backend --workspace=shared --omit=dev

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source files
COPY backend/tsconfig.json ./backend/
COPY shared/tsconfig.json ./shared/
COPY backend/src ./backend/src
COPY shared/src ./shared/src

# Build TypeScript
RUN npm run build --workspace=backend

# Production stage - minimal image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only production files
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/node_modules ./shared/node_modules
COPY --from=builder /app/backend/package.json ./package.json

# Set environment to production
ENV NODE_ENV=production

# Note: Entrypoint is specified in yc serverless function version create command
# Yandex Cloud Functions will call handler.handler via --entrypoint flag

