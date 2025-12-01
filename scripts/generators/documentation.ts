import * as fs from 'fs-extra';
import * as path from 'path';
import { FigmaFile } from '../utils/figma-api';

interface ImportStats {
  tokens: number;
  components: number;
  errors: string[];
  warnings: string[];
}

export async function generateDocumentation(
  fileInfo: FigmaFile,
  stats: ImportStats,
  outputPath: string
) {
  const figmaUrl = `https://www.figma.com/file/${process.env.FIGMA_FILE_ID || 'EEEblmXzjWISAPdvHnzD9N'}`;

  const docContent = `# Дизайн-система

> Автоматически сгенерировано из Figma файла: [${fileInfo.name}](${figmaUrl})

## 📊 Статистика

- **Токенов**: ${stats.tokens}
- **Компонентов**: ${stats.components}
${stats.errors.length > 0 ? `- **Ошибок**: ${stats.errors.length}` : ''}
${stats.warnings.length > 0 ? `- **Предупреждений**: ${stats.warnings.length}` : ''}

## 🎨 Токены

### Цвета

Токены цветов доступны в \`design-system/tokens/colors.ts\`:

\`\`\`typescript
import { colors } from '@/design-system/tokens';

// Использование
const primaryColor = colors.primary;
\`\`\`

CSS переменные:

\`\`\`css
.element {
  background-color: var(--color-primary);
}
\`\`\`

### Типографика

Токены типографики в \`design-system/tokens/typography.ts\`:

\`\`\`typescript
import { typography } from '@/design-system/tokens';

// Использование
const textStyle = typography.text1;
\`\`\`

### Отступы

Токены отступов в \`design-system/tokens/spacing.ts\`:

\`\`\`typescript
import { spacing } from '@/design-system/tokens';

// Использование
const margin = spacing.base; // 16px
\`\`\`

### Радиусы

Токены скруглений в \`design-system/tokens/radius.ts\`:

\`\`\`typescript
import { radius } from '@/design-system/tokens';

// Использование
const borderRadius = radius.md; // 8px
\`\`\`

### Тени

Токены теней в \`design-system/tokens/shadows.ts\`:

\`\`\`typescript
import { shadows } from '@/design-system/tokens';

// Использование
const boxShadow = shadows.md;
\`\`\`

## 🧩 Компоненты

Все компоненты находятся в \`design-system/components/\`.

### Использование компонентов

\`\`\`typescript
import { Button } from '@/design-system/components';

<Button variant="primary">
  Click me
</Button>
\`\`\`

### Структура компонента

Каждый компонент состоит из:

- \`ComponentName.tsx\` - React компонент
- \`ComponentName.types.ts\` - TypeScript типы
- \`ComponentName.module.css\` - CSS Module стили
- \`index.ts\` - Экспорты

## 🔗 Связь с Figma

| Figma Frame | React Component | Путь |
|------------|----------------|------|
| Button/Primary | Button | \`components/Button/\` |
| Card | Card | \`components/Card/\` |

*Полный список компонентов см. в исходном Figma файле: [${figmaUrl}](${figmaUrl})*

## 🎯 Best Practices

1. **Всегда используйте токены** вместо hardcoded значений
2. **Импортируйте компоненты** из \`design-system/components\`
3. **Используйте CSS переменные** для темной темы
4. **Следуйте структуре** из Figma Design System

## 🔄 Обновление дизайн-системы

Для обновления дизайн-системы из Figma:

\`\`\`bash
npm run import:figma
\`\`\`

Этот скрипт:
1. Подключается к Figma API
2. Извлекает все токены и компоненты
3. Генерирует TypeScript и CSS файлы
4. Обновляет документацию

## 📝 Примечания

${stats.errors.length > 0 ? `### ⚠️ Ошибки при импорте\n\n${stats.errors.map(e => `- ${e}`).join('\n')}\n\n` : ''}
${stats.warnings.length > 0 ? `### ⚠️ Предупреждения\n\n${stats.warnings.map(w => `- ${w}`).join('\n')}\n\n` : ''}

---

*Последнее обновление: ${new Date().toLocaleString('ru-RU')}*
`;

  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, docContent);
}

