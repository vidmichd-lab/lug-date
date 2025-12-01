# Архитектура системы

Подробное описание архитектуры Telegram Dating App.

## Обзор

Приложение построено на микросервисной архитектуре с использованием serverless функций Yandex Cloud.

```mermaid
graph TB
    subgraph "Client Layer"
        A[Telegram WebView] --> B[Frontend App]
        C[Telegram Bot] --> D[Bot Service]
        E[Admin Browser] --> F[Admin Panel]
    end
    
    subgraph "API Gateway"
        G[Yandex API Gateway] --> H[Routing]
    end
    
    subgraph "Application Layer"
        H --> I[Backend API<br/>Cloud Functions]
        D --> I
        F --> I
    end
    
    subgraph "Data Layer"
        I --> J[YDB Database<br/>Serverless]
        I --> K[Object Storage<br/>Images & Files]
    end
    
    subgraph "Monitoring & Logging"
        I --> L[Sentry<br/>Error Tracking]
        I --> M[Yandex Cloud Logging]
        I --> N[Alerts<br/>Telegram/Email]
    end
    
    subgraph "CDN"
        O[Yandex CDN] --> B
        O --> F
    end
    
    style A fill:#0088cc
    style B fill:#61dafb
    style I fill:#339933
    style J fill:#ff9900
    style K fill:#ff9900
```

## Компоненты системы

### 1. Frontend (Telegram Web App)

**Технологии:**
- React 18 + TypeScript
- Vite для сборки
- React Router для роутинга
- TanStack Query для кеширования

**Архитектура:**

```mermaid
graph LR
    A[main.tsx] --> B[App.tsx]
    B --> C[Router]
    C --> D[Pages<br/>Lazy Loaded]
    D --> E[Components]
    E --> F[Design System]
    B --> G[QueryClient]
    G --> H[API Calls]
```

**Особенности:**
- Code splitting через React.lazy()
- Оптимизированные изображения с lazy loading
- Кеширование через React Query (5 минут)
- Preload критических ресурсов

### 2. Backend API

**Технологии:**
- Node.js + Express + TypeScript
- Yandex Cloud Functions (serverless)
- Sharp для оптимизации изображений

**Архитектура:**

```mermaid
graph TB
    A[API Gateway] --> B[Express App]
    B --> C[Middleware Layer]
    C --> D[Request Logger]
    C --> E[CORS]
    C --> F[Auth]
    C --> G[Routes]
    G --> H[Admin Routes]
    G --> I[Matches Routes]
    G --> J[Photos Routes]
    G --> K[Error Handler]
    K --> L[Sentry]
    K --> M[Alerts]
```

**Middleware Pipeline:**

1. **Request Logger** - логирование всех запросов
2. **CORS** - настройка CORS для админки
3. **Authentication** - проверка Telegram initData
4. **Routes** - обработка запросов
5. **Error Handler** - обработка ошибок

### 3. Database (YDB)

**Архитектура:**

```mermaid
erDiagram
    USERS ||--o{ MATCHES : creates
    USERS ||--o{ LIKES : gives
    USERS ||--o{ LIKES : receives
    EVENTS ||--o{ MATCHES : generates
    EVENTS ||--o{ LIKES : associated
    MATCHES ||--o{ MESSAGES : contains
    
    USERS {
        string id PK
        number telegramId
        string firstName
        string lastName
        string photoUrl
        string bio
        number age
        datetime createdAt
    }
    
    EVENTS {
        string id PK
        string title
        string description
        string category
        string imageUrl
        string location
        datetime date
    }
    
    MATCHES {
        string id PK
        string userId1 FK
        string userId2 FK
        string eventId FK
        datetime createdAt
    }
    
    LIKES {
        string id PK
        string fromUserId FK
        string toUserId FK
        string eventId FK
        datetime createdAt
    }
    
    MESSAGES {
        string id PK
        string matchId FK
        string senderId FK
        string content
        datetime createdAt
    }
```

### 4. Object Storage

**Структура:**

```
bucket/
├── photos/
│   ├── {userId}/
│   │   ├── thumbnail.webp
│   │   ├── thumbnail.jpg
│   │   ├── medium.webp
│   │   ├── medium.jpg
│   │   ├── full.webp
│   │   └── full.jpg
│   └── ...
└── events/
    └── {eventId}/
        └── ...
```

**Оптимизация:**
- Автоматическое создание 3 размеров (thumbnail, medium, full)
- WebP формат (основной) + JPEG (фоллбэк)
- Blur placeholder для быстрой загрузки

### 5. Bot Service

**Архитектура:**

```mermaid
graph LR
    A[Telegram] --> B[Bot Service]
    B --> C[Commands Handler]
    B --> D[Webhook Handler]
    C --> E[Backend API]
    D --> E
```

**Функции:**
- Обработка команд (`/start`, `/help`)
- Уведомления о матчах
- Интеграция с Web App

### 6. Admin Panel

**Архитектура:**

```mermaid
graph TB
    A[Admin Panel] --> B[Dashboard]
    B --> C[Analytics]
    B --> D[User Management]
    B --> E[Event Management]
    C --> F[Charts]
    C --> G[Reports]
```

**Функции:**
- Аналитика пользователей
- Управление событиями
- Экспорт данных
- Мониторинг системы

## Потоки данных

### Создание матча

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant B as Bot
    
    U->>F: Лайк пользователя
    F->>A: POST /api/v1/matches
    A->>D: Проверить взаимный лайк
    D-->>A: Результат
    alt Взаимный лайк
        A->>D: Создать матч
        A->>B: Отправить уведомление
        A-->>F: Успех
        F-->>U: Показать матч
    else Нет взаимного лайка
        A->>D: Сохранить лайк
        A-->>F: Лайк сохранен
    end
```

### Загрузка фото

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Sharp
    participant O as Object Storage
    participant D as Database
    
    U->>F: Выбрать фото
    F->>A: POST /api/v1/photos (multipart)
    A->>S: Оптимизировать изображение
    S-->>A: 3 размера (WebP + JPEG)
    A->>O: Загрузить все варианты
    O-->>A: URLs
    A->>D: Сохранить URLs
    D-->>A: Успех
    A-->>F: Photo URLs + blur placeholder
    F-->>U: Показать фото
```

## Безопасность

### Аутентификация

```mermaid
graph LR
    A[Telegram] --> B[initData]
    B --> C[Backend Validation]
    C --> D[Verify Signature]
    D --> E[Extract User Data]
    E --> F[Create/Update User]
```

**Процесс:**
1. Telegram отправляет `initData` в Web App
2. Frontend передает `initData` в API
3. Backend проверяет подпись через Telegram Bot API
4. Извлекает данные пользователя
5. Создает или обновляет пользователя в БД

### Валидация данных

- Все входные данные валидируются через Zod
- Sanitize пользовательского контента
- Rate limiting на все endpoints
- Проверка размера файлов

## Масштабирование

### Горизонтальное масштабирование

```mermaid
graph TB
    A[Load Balancer] --> B[API Instance 1]
    A --> C[API Instance 2]
    A --> D[API Instance N]
    B --> E[YDB<br/>Serverless]
    C --> E
    D --> E
```

**Особенности:**
- YDB Serverless автоматически масштабируется
- Cloud Functions масштабируются автоматически
- Object Storage неограничен

### Кеширование

```mermaid
graph LR
    A[Client] --> B{CDN Cache?}
    B -->|Hit| C[CDN]
    B -->|Miss| D[Origin]
    D --> E[React Query Cache]
    E --> F[API]
```

**Уровни кеширования:**
1. **CDN** - статические файлы (1 год)
2. **React Query** - API данные (5 минут)
3. **Browser Cache** - изображения и ресурсы

## Мониторинг

### Логирование

```mermaid
graph TB
    A[Application] --> B[Pino Logger]
    B --> C[Yandex Cloud Logging]
    B --> D[Console<br/>Development]
    C --> E[Search & Analytics]
```

**Типы логов:**
- HTTP запросы (все)
- Создание матчей
- Ошибки загрузки фото
- Критические ошибки

### Error Tracking

```mermaid
graph LR
    A[Error] --> B[Error Handler]
    B --> C[Sentry]
    B --> D[Logger]
    C --> E[Alerts]
    D --> F[Cloud Logging]
```

**Алерты:**
- Telegram уведомления
- Email уведомления

## Деплой

### CI/CD Pipeline

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C[Tests]
    C --> D[Build]
    D --> E[Deploy to Staging]
    E --> F[Tests]
    F --> G[Deploy to Production]
    G --> H[Yandex Cloud]
```

**Этапы:**
1. **Tests** - запуск тестов
2. **Build** - сборка всех сервисов
3. **Deploy Staging** - деплой в staging
4. **Integration Tests** - тесты на staging
5. **Deploy Production** - деплой в production

## Best Practices

1. **Separation of Concerns** - каждый сервис независим
2. **Type Safety** - TypeScript везде
3. **Error Handling** - централизованная обработка ошибок
4. **Logging** - структурированное логирование
5. **Monitoring** - мониторинг всех компонентов
6. **Security** - валидация и sanitize всех данных
7. **Performance** - оптимизация на всех уровнях

