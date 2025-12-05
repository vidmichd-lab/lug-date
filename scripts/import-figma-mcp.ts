/**
 * Альтернативный скрипт импорта через MCP Figma Desktop
 * Использует MCP сервер для получения Variables напрямую из Figma Desktop
 *
 * Использование:
 * 1. Откройте Figma Desktop приложение
 * 2. Откройте файл с дизайн-системой
 * 3. Выберите узел с Variables (или корневой узел)
 * 4. Запустите: npm run import:figma:mcp
 */

import 'dotenv/config';
import * as fs from 'fs-extra';
import * as path from 'path';
import { generateTokens } from './generators/tokens';
import { generateComponents } from './generators/components';
import { generateDocumentation } from './generators/documentation';
import { formatFiles } from './utils/formatter';

const DESIGN_SYSTEM_PATH = path.join(__dirname, '../frontend/src/design-system');
const TOKENS_PATH = path.join(DESIGN_SYSTEM_PATH, 'tokens');
const COMPONENTS_PATH = path.join(DESIGN_SYSTEM_PATH, 'components');

interface ImportStats {
  tokens: number;
  components: number;
  errors: string[];
  warnings: string[];
}

async function main() {
  console.log('🎨 Импорт дизайн-системы через MCP Figma Desktop...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 Инструкция:');
  console.log('   1. Убедитесь, что Figma Desktop открыт');
  console.log('   2. Откройте файл с дизайн-системой');
  console.log('   3. Выберите узел с Variables (или корневой узел)');
  console.log('   4. Этот скрипт использует MCP для получения данных\n');

  const stats: ImportStats = {
    tokens: 0,
    components: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Создание структуры папок
    await fs.ensureDir(TOKENS_PATH);
    await fs.ensureDir(COMPONENTS_PATH);

    // MCP вызовы делаются через специальные инструменты
    // В реальном использовании здесь будут вызовы MCP функций

    console.log('⚠️  Этот скрипт требует интеграции с MCP Figma Desktop');
    console.log('   MCP функции должны вызываться из основного процесса\n');

    // Генерация стандартных токенов
    await generateTokens({}, TOKENS_PATH);
    console.log('✓ Созданы стандартные токены\n');

    // Создание index.ts для токенов
    await createTokensIndex(TOKENS_PATH);

    // Форматирование файлов
    console.log('🎨 Форматирование файлов...');
    await formatFiles(DESIGN_SYSTEM_PATH);
    console.log('✓ Файлы отформатированы\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Импорт завершен!');
    console.log(`   Токенов: ${stats.tokens}`);
    console.log(`   Компонентов: ${stats.components}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

async function createTokensIndex(tokensPath: string) {
  const indexContent = `// Auto-generated index file for design tokens
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadows';
export * from './breakpoints';
`;
  await fs.writeFile(path.join(tokensPath, 'index.ts'), indexContent);
}

main().catch(console.error);

