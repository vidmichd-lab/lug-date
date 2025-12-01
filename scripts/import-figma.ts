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

interface ImportStats {
  tokens: number;
  components: number;
  images: number;
  errors: string[];
}

const stats: ImportStats = {
  tokens: 0,
  components: 0,
  images: 0,
  errors: [],
};

async function importFromFigma() {
  console.log('🎨 Импорт дизайн-системы из Figma...\n');
  console.log(`📂 File ID: ${FIGMA_FILE_ID}\n`);

  try {
    // 1. Получить файл
    console.log('1️⃣  Получение файла из Figma...');
    const fileResponse = await axios.get(
      `${API_BASE}/files/${FIGMA_FILE_ID}`,
      { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
    );

    const file = fileResponse.data;
    console.log(`   ✓ Файл: ${file.name}`);
    console.log(`   ✓ Последнее изменение: ${new Date(file.lastModified).toLocaleString('ru-RU')}`);
    console.log(`   ✓ Страниц: ${file.document.children.length}\n`);

    // 2. Получить Variables (токены)
    console.log('2️⃣  Получение Variables (токены)...');
    try {
      const variablesResponse = await axios.get(
        `${API_BASE}/files/${FIGMA_FILE_ID}/variables/local`,
        { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
      );
      
      const variables = variablesResponse.data.meta?.variables || {};
      const collections = variablesResponse.data.meta?.collections || {};
      
      console.log(`   ✓ Variables найдено: ${Object.keys(variables).length}`);
      console.log(`   ✓ Collections найдено: ${Object.keys(collections).length}\n`);
      
      await createTokensFromVariables(variables, collections);
      stats.tokens = Object.keys(variables).length;
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('   ⚠️  Variables API требует Enterprise план');
      } else {
        console.log('   ⚠️  Variables не найдены');
      }
      console.log('   ✓ Создаем стандартные токены\n');
      await createDefaultTokens();
    }

    // 3. Получить Components
    console.log('3️⃣  Получение Components...');
    const components = file.components || {};
    const componentKeys = Object.keys(components);
    console.log(`   ✓ Components найдено: ${componentKeys.length}\n`);

    // 4. Создать структуру компонентов
    console.log('4️⃣  Создание структуры компонентов...');
    await createComponentsStructure(components, file.document);
    stats.components = componentKeys.length;

    // 5. Экспортировать изображения компонентов
    console.log('5️⃣  Экспорт превью компонентов...');
    await exportComponentImages(componentKeys);
    console.log(`   ✓ Экспортировано ${stats.images} изображений\n`);

    // 6. Создать CSS переменные
    console.log('6️⃣  Создание CSS переменных...');
    await createCSSVariables();
    console.log('   ✓ CSS переменные созданы\n');

    // 7. Создать главный index.ts
    console.log('7️⃣  Создание главного index.ts...');
    await createMainIndex();
    console.log('   ✓ Главный index.ts создан\n');

    // 8. Генерация документации
    console.log('8️⃣  Генерация документации...');
    await generateDocumentation(file, stats);
    console.log('   ✓ Документация создана\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Импорт завершен успешно!');
    console.log(`   📦 Токенов: ${stats.tokens}`);
    console.log(`   🧩 Компонентов: ${stats.components}`);
    console.log(`   🖼️  Изображений: ${stats.images}`);
    if (stats.errors.length > 0) {
      console.log(`   ⚠️  Ошибок: ${stats.errors.length}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ Критическая ошибка:', error.message);
    if (error.response) {
      console.error(`   Статус: ${error.response.status}`);
      console.error(`   Данные: ${JSON.stringify(error.response.data)}`);
    }
    process.exit(1);
  }
}

async function createTokensFromVariables(variables: any, collections: any) {
  const tokensDir = 'frontend/src/design-system/tokens';
  await fs.ensureDir(tokensDir);

  const colors: any = { light: {}, dark: {} };
  const spacing: any = {};
  const typography: any = {};
  const radius: any = {};
  const shadows: any = {};

  // Обработка Variables
  Object.values(variables).forEach((variable: any) => {
    const name = variable.name || '';
    const parts = name.split('/');
    const category = parts[0]?.toLowerCase() || '';
    const key = parts.slice(1).join('') || name;

    // Получаем значения для разных режимов
    const valuesByMode = variable.valuesByMode || {};
    const modeIds = Object.keys(valuesByMode);
    
    if (modeIds.length > 0) {
      const firstMode = modeIds[0];
      const value = valuesByMode[firstMode];

      if (category.includes('color') || category.includes('colour')) {
        if (typeof value === 'object' && value.r !== undefined) {
          const hex = rgbaToHex(value);
          colors.light[key] = hex;
          // Для темной темы используем то же значение или инвертируем
          if (modeIds.length > 1) {
            const darkValue = valuesByMode[modeIds[1]];
            if (typeof darkValue === 'object' && darkValue.r !== undefined) {
              colors.dark[key] = rgbaToHex(darkValue);
            } else {
              colors.dark[key] = hex;
            }
          } else {
            colors.dark[key] = hex;
          }
        }
      } else if (category.includes('spacing') || category.includes('gap') || category.includes('padding') || category.includes('margin')) {
        spacing[key] = typeof value === 'number' ? `${value}px` : value;
      } else if (category.includes('radius') || category.includes('border')) {
        radius[key] = typeof value === 'number' ? `${value}px` : value;
      } else if (category.includes('font') || category.includes('text') || category.includes('typography')) {
        typography[key] = value;
      } else if (category.includes('shadow') || category.includes('elevation')) {
        shadows[key] = value;
      }
    }
  });

  await saveTokens(colors, spacing, typography, radius, shadows);
}

function rgbaToHex(color: { r: number; g: number; b: number; a?: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;
  
  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

async function createDefaultTokens() {
  const tokens = {
    colors: {
      light: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        background: '#FFFFFF',
        backgroundSecondary: '#F8F9FA',
        text: '#2D3436',
        textSecondary: '#636E72',
        border: '#DFE6E9',
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        info: '#007AFF',
      },
      dark: {
        primary: '#FF8E8E',
        secondary: '#6EDDD6',
        background: '#1A1A1A',
        backgroundSecondary: '#2D2D2D',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        border: '#404040',
        error: '#FF5C5C',
        success: '#4CD964',
        warning: '#FFB340',
        info: '#5AC8FA',
      },
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '40px',
      '4xl': '48px',
      '5xl': '64px',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: { fontSize: '32px', fontWeight: '700', lineHeight: '40px', letterSpacing: '-0.5px' },
      h2: { fontSize: '24px', fontWeight: '600', lineHeight: '32px', letterSpacing: '-0.3px' },
      h3: { fontSize: '20px', fontWeight: '600', lineHeight: '28px', letterSpacing: '0px' },
      body: { fontSize: '16px', fontWeight: '400', lineHeight: '24px', letterSpacing: '0px' },
      bodySmall: { fontSize: '14px', fontWeight: '400', lineHeight: '20px', letterSpacing: '0.1px' },
      caption: { fontSize: '12px', fontWeight: '400', lineHeight: '16px', letterSpacing: '0.2px' },
    },
    radius: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '24px',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  };

  await saveTokens(
    tokens.colors,
    tokens.spacing,
    tokens.typography,
    tokens.radius,
    tokens.shadows
  );
}

async function saveTokens(colors: any, spacing: any, typography: any, radius: any, shadows: any) {
  const tokensDir = 'frontend/src/design-system/tokens';
  await fs.ensureDir(tokensDir);

  // colors.ts
  const colorsContent = `// Auto-generated color tokens
export const colors = ${JSON.stringify(colors, null, 2)};

// CSS Variables helper
export const colorCSSVars = {
  ...Object.entries(colors.light).reduce((acc, [key, value]) => {
    acc[\`--color-\${key.replace(/([A-Z])/g, '-$1').toLowerCase()}\`] = value;
    return acc;
  }, {} as Record<string, any>),
} as const;
`;
  await fs.writeFile(`${tokensDir}/colors.ts`, colorsContent);

  // spacing.ts
  const spacingContent = `// Auto-generated spacing tokens
export const spacing = ${JSON.stringify(spacing, null, 2)};

// CSS Variables
export const spacingCSSVars = {
  ...Object.entries(spacing).reduce((acc, [key, value]) => {
    acc[\`--spacing-\${key.replace(/([A-Z])/g, '-$1').toLowerCase()}\`] = value;
    return acc;
  }, {} as Record<string, any>),
} as const;
`;
  await fs.writeFile(`${tokensDir}/spacing.ts`, spacingContent);

  // typography.ts
  const typographyContent = `// Auto-generated typography tokens
export const typography = ${JSON.stringify(typography, null, 2)};

// CSS Variables
export const typographyCSSVars = {
  '--font-family': typography.fontFamily,
  ...Object.entries(typography).filter(([key]) => key !== 'fontFamily').reduce((acc, [key, value]: [string, any]) => {
    if (typeof value === 'object') {
      acc[\`--font-\${key}-size\`] = value.fontSize;
      acc[\`--font-\${key}-weight\`] = value.fontWeight;
      acc[\`--font-\${key}-line-height\`] = value.lineHeight;
    }
    return acc;
  }, {} as Record<string, any>),
} as const;
`;
  await fs.writeFile(`${tokensDir}/typography.ts`, typographyContent);

  // radius.ts
  const radiusContent = `// Auto-generated radius tokens
export const radius = ${JSON.stringify(radius, null, 2)};

// CSS Variables
export const radiusCSSVars = {
  ...Object.entries(radius).reduce((acc, [key, value]) => {
    acc[\`--radius-\${key.replace(/([A-Z])/g, '-$1').toLowerCase()}\`] = value;
    return acc;
  }, {} as Record<string, any>),
} as const;
`;
  await fs.writeFile(`${tokensDir}/radius.ts`, radiusContent);

  // shadows.ts
  const shadowsContent = `// Auto-generated shadow tokens
export const shadows = ${JSON.stringify(shadows, null, 2)};

// CSS Variables
export const shadowsCSSVars = {
  ...Object.entries(shadows).reduce((acc, [key, value]) => {
    acc[\`--shadow-\${key.replace(/([A-Z])/g, '-$1').toLowerCase()}\`] = value;
    return acc;
  }, {} as Record<string, any>),
} as const;
`;
  await fs.writeFile(`${tokensDir}/shadows.ts`, shadowsContent);

  // breakpoints.ts
  const breakpointsContent = `// Responsive breakpoints
export const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
} as const;

export const breakpointCSSVars = {
  '--breakpoint-mobile': breakpoints.mobile,
  '--breakpoint-tablet': breakpoints.tablet,
  '--breakpoint-desktop': breakpoints.desktop,
} as const;
`;
  await fs.writeFile(`${tokensDir}/breakpoints.ts`, breakpointsContent);

  // index.ts
  const indexContent = `// Auto-generated index file for design tokens
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './radius';
export * from './shadows';
export * from './breakpoints';
`;
  await fs.writeFile(`${tokensDir}/index.ts`, indexContent);

  stats.tokens = Object.keys(colors.light || {}).length + 
                 Object.keys(spacing).length + 
                 Object.keys(typography).length + 
                 Object.keys(radius).length + 
                 Object.keys(shadows).length;
}

async function createComponentsStructure(components: any, document: any) {
  const componentsDir = 'frontend/src/design-system/components';
  await fs.ensureDir(componentsDir);

  let count = 0;
  
  for (const [key, component] of Object.entries(components)) {
    try {
      const comp: any = component;
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

      // Component.module.css
      const cssCode = `.${componentName.toLowerCase()} {
  /* Auto-generated styles from Figma */
  /* TODO: Implement styles based on Figma design */
}
`;
      await fs.writeFile(`${componentDir}/${componentName}.module.css`, cssCode);

      // index.ts
      const indexCode = `export { ${componentName} } from './${componentName}';
export type { ${componentName}Props } from './${componentName}.types';
`;
      await fs.writeFile(`${componentDir}/index.ts`, indexCode);

      count++;
    } catch (error: any) {
      stats.errors.push(`Ошибка создания компонента ${key}: ${error.message}`);
    }
  }

  console.log(`   ✓ Создано ${count} компонентов`);
}

function sanitizeComponentName(name: string): string {
  // Конвертация в PascalCase
  return name
    .split(/[\s\-_/]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[0-9]/, '') || 'Component';
}

async function exportComponentImages(componentKeys: string[]) {
  const imagesDir = 'docs/design-system/images';
  await fs.ensureDir(imagesDir);

  // Экспортируем первые 10 компонентов для превью
  const keysToExport = componentKeys.slice(0, 10);
  
  for (const key of keysToExport) {
    try {
      const response = await axios.get(
        `${API_BASE}/images/${FIGMA_FILE_ID}?ids=${key}&format=png&scale=2`,
        { 
          headers: { 'X-Figma-Token': FIGMA_TOKEN },
          timeout: 10000,
        }
      );
      
      const imageUrl = response.data.images?.[key];
      if (imageUrl) {
        const imageResponse = await axios.get(imageUrl, { 
          responseType: 'arraybuffer',
          timeout: 10000,
        });
        const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
        await fs.writeFile(`${imagesDir}/${safeKey}.png`, imageResponse.data);
        stats.images++;
      }
    } catch (error: any) {
      // Игнорируем ошибки экспорта изображений
    }
  }
}

async function createCSSVariables() {
  const tokensDir = 'frontend/src/design-system/tokens';
  const cssContent = `/* Auto-generated CSS Variables from Figma tokens */

:root {
  /* Colors - Light theme */
  --color-primary: #FF6B6B;
  --color-secondary: #4ECDC4;
  --color-background: #FFFFFF;
  --color-background-secondary: #F8F9FA;
  --color-text: #2D3436;
  --color-text-secondary: #636E72;
  --color-border: #DFE6E9;
  --color-error: #FF3B30;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-info: #007AFF;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-base: 16px;
  --spacing-lg: 20px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --spacing-3xl: 40px;
  --spacing-4xl: 48px;
  --spacing-5xl: 64px;
  
  /* Radius */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-h1-size: 32px;
  --font-h1-weight: 700;
  --font-h1-line-height: 40px;
  --font-h2-size: 24px;
  --font-h2-weight: 600;
  --font-h2-line-height: 32px;
  --font-h3-size: 20px;
  --font-h3-weight: 600;
  --font-h3-line-height: 28px;
  --font-body-size: 16px;
  --font-body-weight: 400;
  --font-body-line-height: 24px;
  
  /* Breakpoints */
  --breakpoint-mobile: 375px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
}

[data-theme="dark"] {
  /* Colors - Dark theme */
  --color-primary: #FF8E8E;
  --color-secondary: #6EDDD6;
  --color-background: #1A1A1A;
  --color-background-secondary: #2D2D2D;
  --color-text: #FFFFFF;
  --color-text-secondary: #CCCCCC;
  --color-border: #404040;
  --color-error: #FF5C5C;
  --color-success: #4CD964;
  --color-warning: #FFB340;
  --color-info: #5AC8FA;
}
`;

  await fs.writeFile(`${tokensDir}/tokens.css`, cssContent);
}

async function createMainIndex() {
  const designSystemDir = 'frontend/src/design-system';
  const indexContent = `// Auto-generated design system index
export * from './tokens';
export * from './components';
`;

  await fs.writeFile(`${designSystemDir}/index.ts`, indexContent);
}

async function generateDocumentation(file: any, stats: ImportStats) {
  const docsDir = 'docs/design-system';
  await fs.ensureDir(docsDir);

  const docContent = `# Дизайн-система

> Автоматически сгенерировано из Figma файла: **${file.name}**

## 📊 Статистика

- **Токенов**: ${stats.tokens}
- **Компонентов**: ${stats.components}
- **Превью изображений**: ${stats.images}
- **Последнее обновление**: ${new Date().toLocaleString('ru-RU')}

## 🎨 Токены

Все токены находятся в \`frontend/src/design-system/tokens/\`

### Использование

\`\`\`typescript
import { colors, spacing, typography, radius, shadows } from '@/design-system/tokens';

// Использование в компонентах
const primaryColor = colors.light.primary;
const baseSpacing = spacing.base;
\`\`\`

### CSS Variables

Импортируйте \`tokens.css\` в ваш главный CSS файл:

\`\`\`css
@import '@/design-system/tokens/tokens.css';
\`\`\`

Затем используйте переменные:

\`\`\`css
.element {
  background-color: var(--color-primary);
  padding: var(--spacing-base);
  border-radius: var(--radius-md);
}
\`\`\`

## 🧩 Компоненты

Всего компонентов: **${stats.components}**

### Использование

\`\`\`typescript
import { ComponentName } from '@/design-system/components';

<ComponentName>
  Content
</ComponentName>
\`\`\`

## 📝 Примечания

${stats.errors.length > 0 ? `### ⚠️ Ошибки при импорте\n\n${stats.errors.map(e => `- ${e}`).join('\n')}\n\n` : ''}

---

*Сгенерировано автоматически из Figma файла: ${FIGMA_FILE_ID}*
`;

  await fs.writeFile(`${docsDir}/README.md`, docContent);
}

importFromFigma().catch((error) => {
  console.error('❌ Ошибка импорта:', error.message);
  if (error.response) {
    console.error('   Статус:', error.response.status);
    console.error('   Данные:', JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
});
