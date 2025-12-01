# Дизайн-система

> Автоматически сгенерировано из Figma файла: **Untitled**

## 📊 Статистика

- **Токенов**: 39
- **Компонентов**: 114
- **Превью изображений**: 10
- **Последнее обновление**: 01.12.2025, 15:13:39

## 🎨 Токены

Все токены находятся в `frontend/src/design-system/tokens/`

### Использование

```typescript
import { colors, spacing, typography, radius, shadows } from '@/design-system/tokens';

// Использование в компонентах
const primaryColor = colors.light.primary;
const baseSpacing = spacing.base;
```

### CSS Variables

Импортируйте `tokens.css` в ваш главный CSS файл:

```css
@import '@/design-system/tokens/tokens.css';
```

Затем используйте переменные:

```css
.element {
  background-color: var(--color-primary);
  padding: var(--spacing-base);
  border-radius: var(--radius-md);
}
```

## 🧩 Компоненты

Всего компонентов: **114**

### Использование

```typescript
import { ComponentName } from '@/design-system/components';

<ComponentName>
  Content
</ComponentName>
```

## 📝 Примечания



---

*Сгенерировано автоматически из Figma файла: EEEblmXzjWISAPdvHnzD9N*
