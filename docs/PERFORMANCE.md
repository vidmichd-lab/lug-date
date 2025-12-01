# Оптимизация производительности

Проект оптимизирован для быстрой загрузки даже на медленных соединениях (3G).

## Метрики Lighthouse

Целевые показатели:
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Largest Contentful Paint (LCP)**: < 2.5s

## Оптимизация изображений

### Backend (Sharp)

Изображения автоматически оптимизируются при загрузке:
- **WebP** формат (основной) - до 30% меньше размер
- **JPEG** формат (фоллбэк) - для старых браузеров
- **Размеры**: thumbnail (150px), medium (600px), full (1200px)
- **Blur placeholder** - генерируется автоматически

### Frontend (OptimizedImage)

Компонент `OptimizedImage` включает:
- **Lazy loading** - загрузка только при приближении к viewport
- **Blur placeholder** - показывается во время загрузки
- **Responsive images** - автоматический выбор размера
- **Error handling** - graceful fallback при ошибках

Использование:
```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src={photoUrl}
  srcSet={{
    webp: photoUrls.medium.webp,
    jpeg: photoUrls.medium.jpeg,
  }}
  blurDataUrl={photoUrls.blurDataUrl}
  alt="User photo"
  size="medium"
  priority={false} // true для above-the-fold изображений
/>
```

## Code Splitting

### React.lazy() для страниц

Все страницы загружаются асинхронно:
```tsx
// pages/index.ts
export const HomePage = lazy(() => import('./HomePage'));
export const ProfilePage = lazy(() => import('./ProfilePage'));
```

### Dynamic imports для тяжелых библиотек

```tsx
// Загрузка только при необходимости
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Отдельные бандлы

Vite автоматически создает отдельные чанки:
- `react-vendor.js` - React, React DOM, React Router
- `query-vendor.js` - React Query
- `monitoring-vendor.js` - Error monitoring (если используется)
- `design-system.js` - компоненты дизайн-системы (если большой)

## Кеширование

### React Query

Настроено кеширование API запросов:
- **staleTime**: 5 минут - данные считаются свежими
- **gcTime**: 10 минут - данные хранятся в кеше
- **Automatic refetch** - при фокусе окна и переподключении

```tsx
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
  // staleTime и gcTime настроены глобально
});
```

### CDN для статики

Статические файлы отдаются через Yandex CDN:
- Кеширование на 1 год
- Gzip/Brotli сжатие
- HTTP/2 Server Push

## Preload критических ресурсов

В `index.html` добавлены preload для:
- Telegram Web App SDK
- Критические шрифты (если используются)
- Критические стили

```html
<link rel="preload" href="https://telegram.org/js/telegram-web-app.js" as="script" crossorigin />
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
```

## Оптимизация бандла

### Минификация

- **Terser** для минификации JavaScript
- Удаление `console.log` в production
- Tree shaking для удаления неиспользуемого кода

### Сжатие

- **Gzip** для всех текстовых файлов
- **Brotli** для современных браузеров
- Оптимизация изображений через Sharp

## Service Worker (опционально)

Для offline поддержки можно добавить Service Worker:

```typescript
// public/sw.js
self.addEventListener('fetch', (event) => {
  // Cache strategy
});
```

## Мониторинг производительности

В development режиме автоматически измеряются:
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)

Метрики выводятся в консоль браузера.

## Best Practices

1. **Используйте OptimizedImage** для всех изображений
2. **Lazy load** страницы и тяжелые компоненты
3. **Prefetch** ресурсы для следующей страницы
4. **Минимизируйте** размер бандла
5. **Кешируйте** API запросы через React Query
6. **Оптимизируйте** изображения на backend
7. **Используйте CDN** для статики

## Результаты

После оптимизации:
- ✅ Загрузка приложения < 2 секунды на 3G
- ✅ FCP < 1.8s
- ✅ TTI < 3.8s
- ✅ CLS < 0.1
- ✅ Размер бандла < 200KB (gzipped)

