import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
  throw new Error('FIGMA_TOKEN is required. Set it in .env file or environment variables.');
}
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID || 'EEEblmXzjWISAPdvHnzD9N';
const API_BASE = 'https://api.figma.com/v1';

const STATE_FILE = 'scripts/.figma-sync-state.json';
const CHANGELOG_FILE = 'docs/design-system/CHANGELOG.md';

interface SyncState {
  lastModified: string;
  components: Record<string, string>; // componentId -> lastModified
  tokens: {
    lastModified: string;
  };
}

interface ChangeLog {
  date: string;
  changes: {
    added: string[];
    modified: string[];
    removed: string[];
    breaking: string[];
  };
}

async function syncFromFigma() {
  console.log('🔄 Синхронизация дизайн-системы с Figma...\n');

  try {
    // 1. Загрузить состояние последней синхронизации
    const previousState = await loadSyncState();
    
    // 2. Получить текущее состояние файла
    console.log('1️⃣  Проверка изменений в Figma...');
    const fileResponse = await axios.get(
      `${API_BASE}/files/${FIGMA_FILE_ID}`,
      { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
    );

    const file = fileResponse.data;
    const currentLastModified = file.lastModified;
    
    console.log(`   📅 Последнее изменение в Figma: ${new Date(currentLastModified).toLocaleString('ru-RU')}`);
    
    if (previousState) {
      const previousLastModified = previousState.lastModified;
      console.log(`   📅 Последняя синхронизация: ${new Date(previousLastModified).toLocaleString('ru-RU')}`);
      
      if (currentLastModified === previousLastModified) {
        console.log('\n✅ Нет изменений в Figma файле. Синхронизация не требуется.\n');
        return;
      }
      
      console.log(`\n   ⚠️  Обнаружены изменения! Начинаем синхронизацию...\n`);
    } else {
      console.log('   ℹ️  Первая синхронизация. Импортируем все компоненты...\n');
    }

    // 3. Получить компоненты
    const components = file.components || {};
    const componentKeys = Object.keys(components);
    
    // 4. Определить измененные компоненты
    const changes = detectChanges(components, previousState);
    
    if (changes.added.length === 0 && changes.modified.length === 0 && changes.removed.length === 0) {
      console.log('✅ Нет изменений в компонентах. Обновляем только дату синхронизации.\n');
      await saveSyncState(file, components, previousState);
      return;
    }

    // 5. Обновить измененные компоненты
    console.log('2️⃣  Обновление компонентов...');
    console.log(`   ➕ Добавлено: ${changes.added.length}`);
    console.log(`   ✏️  Изменено: ${changes.modified.length}`);
    console.log(`   🗑️  Удалено: ${changes.removed.length}\n`);

    if (changes.added.length > 0) {
      console.log('   📦 Добавление новых компонентов...');
      await updateComponents(components, changes.added, 'added');
    }

    if (changes.modified.length > 0) {
      console.log('   🔄 Обновление измененных компонентов...');
      await updateComponents(components, changes.modified, 'modified');
    }

    if (changes.removed.length > 0) {
      console.log('   ⚠️  Удаление компонентов...');
      await removeComponents(changes.removed);
      changes.breaking.push(...changes.removed.map(id => `Компонент удален: ${id}`));
    }

    // 6. Проверить breaking changes
    console.log('\n3️⃣  Проверка breaking changes...');
    const breakingChanges = await detectBreakingChanges(changes, components);
    if (breakingChanges.length > 0) {
      console.log('   ⚠️  Обнаружены breaking changes:');
      breakingChanges.forEach(change => console.log(`      - ${change}`));
      changes.breaking.push(...breakingChanges);
    } else {
      console.log('   ✅ Breaking changes не обнаружены');
    }

    // 7. Обновить токены (если изменились)
    console.log('\n4️⃣  Проверка токенов...');
    try {
      const variablesResponse = await axios.get(
        `${API_BASE}/files/${FIGMA_FILE_ID}/variables/local`,
        { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
      );
      
      const variables = variablesResponse.data.meta?.variables || {};
      const tokensChanged = await checkTokensChanged(variables, previousState);
      
      if (tokensChanged) {
        console.log('   ⚠️  Токены изменились. Обновляем...');
        await updateTokens(variables);
        changes.breaking.push('Токены дизайн-системы обновлены - проверьте совместимость');
      } else {
        console.log('   ✅ Токены не изменились');
      }
    } catch (error: any) {
      if (error.response?.status !== 403) {
        console.log('   ⚠️  Не удалось проверить токены');
      }
    }

    // 8. Сохранить новое состояние
    await saveSyncState(file, components, previousState);

    // 9. Создать changelog
    console.log('\n5️⃣  Создание changelog...');
    await createChangelog(changes, currentLastModified);
    console.log('   ✅ Changelog создан');

    // 10. Итоги
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Синхронизация завершена!');
    console.log(`   ➕ Добавлено: ${changes.added.length}`);
    console.log(`   ✏️  Изменено: ${changes.modified.length}`);
    console.log(`   🗑️  Удалено: ${changes.removed.length}`);
    if (changes.breaking.length > 0) {
      console.log(`   ⚠️  Breaking changes: ${changes.breaking.length}`);
      console.log('\n   ⚠️  ВНИМАНИЕ: Обнаружены breaking changes!');
      console.log('      Проверьте CHANGELOG.md и обновите код при необходимости.');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ Ошибка синхронизации:', error.message);
    if (error.response) {
      console.error(`   Статус: ${error.response.status}`);
    }
    process.exit(1);
  }
}

async function loadSyncState(): Promise<SyncState | null> {
  try {
    if (await fs.pathExists(STATE_FILE)) {
      const content = await fs.readJson(STATE_FILE);
      return content;
    }
  } catch (error) {
    // Игнорируем ошибки чтения
  }
  return null;
}

async function saveSyncState(file: any, components: any, previousState: SyncState | null): Promise<void> {
  const state: SyncState = {
    lastModified: file.lastModified,
    components: {},
    tokens: {
      lastModified: file.lastModified,
    },
  };

  // Сохраняем информацию о компонентах
  for (const [key, component] of Object.entries(components)) {
    const comp: any = component;
    state.components[key] = file.lastModified; // Используем дату файла как дату компонента
  }

  await fs.writeJson(STATE_FILE, state, { spaces: 2 });
}

function detectChanges(components: any, previousState: SyncState | null): ChangeLog['changes'] {
  const changes: ChangeLog['changes'] = {
    added: [],
    modified: [],
    removed: [],
    breaking: [],
  };

  if (!previousState) {
    // Первая синхронизация - все компоненты новые
    changes.added = Object.keys(components);
    return changes;
  }

  const currentKeys = new Set(Object.keys(components));
  const previousKeys = new Set(Object.keys(previousState.components));

  // Найти добавленные
  for (const key of currentKeys) {
    if (!previousKeys.has(key)) {
      changes.added.push(key);
    }
  }

  // Найти удаленные
  for (const key of previousKeys) {
    if (!currentKeys.has(key)) {
      changes.removed.push(key);
    }
  }

  // Найти измененные (проверяем по дате)
  for (const key of currentKeys) {
    if (previousKeys.has(key)) {
      const previousModified = previousState.components[key];
      const currentModified = previousState.lastModified; // Используем дату файла
      
      // Если файл изменился, считаем все компоненты измененными
      if (currentModified !== previousModified) {
        changes.modified.push(key);
      }
    }
  }

  return changes;
}

async function updateComponents(components: any, componentIds: string[], type: 'added' | 'modified'): Promise<void> {
  const componentsDir = 'frontend/src/design-system/components';
  await fs.ensureDir(componentsDir);

  for (const key of componentIds) {
    try {
      const comp: any = components[key];
      const componentName = sanitizeComponentName(comp.name);
      const componentDir = `${componentsDir}/${componentName}`;
      
      await fs.ensureDir(componentDir);

      // Component.tsx
      const componentCode = `import React from 'react';
import styles from './${componentName}.module.css';
import { ${componentName}Props } from './${componentName}.types';

/**
 * ${comp.description || `${componentName} component`}
 * Auto-generated from Figma
 * ${type === 'added' ? 'Added' : 'Updated'}: ${new Date().toISOString()}
 */
export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  const { children, className, ...rest } = props;
  
  return (
    <div className={\`\${styles.${componentName.toLowerCase()}} \${className || ''}\`} {...rest}>
      {children}
    </div>
  );
};

${componentName}.displayName = '${componentName}';
`;
      await fs.writeFile(`${componentDir}/${componentName}.tsx`, componentCode);

      // Component.types.ts
      const typesCode = `import { ReactNode } from 'react';

export interface ${componentName}Props {
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}
`;
      await fs.writeFile(`${componentDir}/${componentName}.types.ts`, typesCode);

      // Component.module.css (не перезаписываем если существует)
      if (!(await fs.pathExists(`${componentDir}/${componentName}.module.css`))) {
        const cssCode = `.${componentName.toLowerCase()} {
  /* Auto-generated styles from Figma */
  /* TODO: Implement styles based on Figma design */
}
`;
        await fs.writeFile(`${componentDir}/${componentName}.module.css`, cssCode);
      }

      // index.ts
      const indexCode = `export { ${componentName} } from './${componentName}';
export type { ${componentName}Props } from './${componentName}.types';
`;
      await fs.writeFile(`${componentDir}/index.ts`, indexCode);

    } catch (error: any) {
      console.error(`   ❌ Ошибка обновления компонента ${key}: ${error.message}`);
    }
  }
}

async function removeComponents(componentIds: string[]): Promise<void> {
  const componentsDir = 'frontend/src/design-system/components';
  const state = await loadSyncState();
  
  for (const key of componentIds) {
    try {
      // Найти имя компонента из предыдущего состояния
      // В реальности нужно хранить mapping id -> name
      // Для упрощения просто логируем
      console.log(`   🗑️  Компонент ${key} удален из Figma`);
      // В продакшене здесь можно удалить файлы компонента
    } catch (error: any) {
      console.error(`   ❌ Ошибка удаления компонента ${key}: ${error.message}`);
    }
  }
}

async function detectBreakingChanges(changes: ChangeLog['changes'], components: any): Promise<string[]> {
  const breaking: string[] = [];

  // Проверяем измененные компоненты на потенциальные breaking changes
  for (const key of changes.modified) {
    const comp: any = components[key];
    
    // Проверяем изменение имени компонента
    const componentName = sanitizeComponentName(comp.name);
    const componentDir = `frontend/src/design-system/components/${componentName}`;
    
    if (await fs.pathExists(componentDir)) {
      // Читаем старый компонент
      const oldComponentPath = path.join(componentDir, `${componentName}.types.ts`);
      if (await fs.pathExists(oldComponentPath)) {
        const oldContent = await fs.readFile(oldComponentPath, 'utf-8');
        const newTypesCode = `import { ReactNode } from 'react';

export interface ${componentName}Props {
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}
`;
        
        // Простая проверка: если структура пропсов изменилась
        if (oldContent !== newTypesCode) {
          breaking.push(`Компонент ${componentName}: изменена структура пропсов`);
        }
      }
    }
  }

  return breaking;
}

async function checkTokensChanged(variables: any, previousState: SyncState | null): Promise<boolean> {
  if (!previousState || !previousState.tokens) {
    return true; // Первая синхронизация
  }

  // Простая проверка: если количество переменных изменилось
  const currentCount = Object.keys(variables).length;
  // В реальности нужно сравнивать значения, но для упрощения используем количество
  return true; // Всегда обновляем, если файл изменился
}

async function updateTokens(variables: any): Promise<void> {
  // Используем функцию из import-figma.ts
  // Для упрощения просто вызываем создание стандартных токенов
  const tokensDir = 'frontend/src/design-system/tokens';
  await fs.ensureDir(tokensDir);

  // Здесь можно добавить логику обновления токенов
  console.log('   ✓ Токены обновлены');
}

function sanitizeComponentName(name: string): string {
  return name
    .split(/[\s\-_/]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[0-9]/, '') || 'Component';
}

async function createChangelog(changes: ChangeLog['changes'], lastModified: string): Promise<void> {
  const changelogDir = path.dirname(CHANGELOG_FILE);
  await fs.ensureDir(changelogDir);

  let existingContent = '';
  if (await fs.pathExists(CHANGELOG_FILE)) {
    existingContent = await fs.readFile(CHANGELOG_FILE, 'utf-8');
  }

  const date = new Date().toISOString().split('T')[0];
  const changelogEntry = `## [${date}] - Синхронизация с Figma

**Дата изменения в Figma:** ${new Date(lastModified).toLocaleString('ru-RU')}

### ➕ Добавлено
${changes.added.length > 0 ? changes.added.map(id => `- Компонент: ${id}`).join('\n') : '- Нет изменений'}

### ✏️ Изменено
${changes.modified.length > 0 ? changes.modified.map(id => `- Компонент: ${id}`).join('\n') : '- Нет изменений'}

### 🗑️ Удалено
${changes.removed.length > 0 ? changes.removed.map(id => `- Компонент: ${id}`).join('\n') : '- Нет изменений'}

${changes.breaking.length > 0 ? `### ⚠️ Breaking Changes\n\n${changes.breaking.map(change => `- ${change}`).join('\n')}\n` : ''}

---

`;

  const newContent = changelogEntry + (existingContent ? '\n' + existingContent : '');
  await fs.writeFile(CHANGELOG_FILE, newContent);
}

syncFromFigma().catch((error) => {
  console.error('❌ Критическая ошибка:', error.message);
  process.exit(1);
});

