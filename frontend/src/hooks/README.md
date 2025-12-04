# React Query Hooks

## Обзор

Хуки для работы с данными через React Query. Автоматически управляют кешированием, invalidation и optimistic updates.

## Использование

### useFeed

Получение ленты событий и профилей:

```typescript
import { useFeed, useLikeAction } from '@/hooks';

function HomePage() {
  const { data, isLoading } = useFeed({
    type: 'events',
    categories: ['Кафе', 'Выставки'],
  });

  const likeMutation = useLikeAction();

  const handleLike = () => {
    likeMutation.mutate({
      action: 'like',
      targetId: 'user-123',
      eventId: 'event-456',
    });
  };

  // После мутации данные автоматически обновятся
}
```

### useMatches

Работа с матчами:

```typescript
import { useMatches, useCreateMatch } from '@/hooks';

function MatchesPage() {
  const { data, isLoading } = useMatches('user-123');
  const createMatch = useCreateMatch();

  const handleCreateMatch = () => {
    createMatch.mutate({
      userId1: 'user-123',
      userId2: 'user-456',
    });
  };
}
```

### useSavedEvents

Работа с сохраненными событиями:

```typescript
import { useSavedEvents, useSaveEvent } from '@/hooks';

function SavedEventsPage() {
  const { data } = useSavedEvents('user-123');
  const saveEvent = useSaveEvent();

  const handleSave = (eventId: string) => {
    saveEvent.mutate({ eventId, action: 'save' });
  };
}
```

## Cache Invalidation

После мутаций автоматически инвалидируются связанные запросы:

- **Like/Dislike** → инвалидирует feed, matches, likes
- **Create Match** → инвалидирует matches, notifications
- **Save Event** → инвалидирует savedEvents

## Optimistic Updates

Некоторые мутации используют optimistic updates для мгновенного обновления UI:

- **Like Action** → удаляет карточку из feed сразу
- **Create Match** → добавляет матч в список сразу
- **Unsave Event** → удаляет событие из списка сразу

## Query Keys

Все query keys определены в `lib/queryClient.ts` для консистентности:

```typescript
queryKeys.feed(type, categories);
queryKeys.matches(userId);
queryKeys.savedEvents(userId);
```

## Best Practices

1. **Используйте хуки вместо прямых вызовов API**
   - Автоматическое кеширование
   - Автоматическая invalidation
   - Optimistic updates

2. **Не дублируйте query keys**
   - Используйте `queryKeys` из `lib/queryClient.ts`

3. **Используйте `enabled` для условных запросов**

   ```typescript
   const { data } = useMatches(userId, { enabled: !!userId });
   ```

4. **Обрабатывайте ошибки**

   ```typescript
   const mutation = useCreateMatch();

   mutation.mutate(data, {
     onError: (error) => {
       console.error('Failed:', error);
     },
   });
   ```
