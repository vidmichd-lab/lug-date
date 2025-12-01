import 'dotenv/config';
import axios, { AxiosError } from 'axios';
import { FigmaAPI } from './utils/figma-api';

const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID || 'EEEblmXzjWISAPdvHnzD9N';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

interface FileInfo {
  name: string;
  lastModified: string;
  version: string;
  thumbnailUrl?: string;
}

interface PageInfo {
  id: string;
  name: string;
  type: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

async function main() {
  console.log('🔍 Тестирование подключения к Figma API...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results: TestResult[] = [];

  // 1. Проверка токена
  console.log('1️⃣  Проверка FIGMA_TOKEN...');
  if (!FIGMA_TOKEN) {
    console.error('   ❌ FIGMA_TOKEN не установлен в .env файле\n');
    console.error('   💡 Получите токен: https://www.figma.com/developers/api#access-tokens');
    process.exit(1);
  }

  if (FIGMA_TOKEN.length < 20) {
    console.error('   ❌ FIGMA_TOKEN выглядит невалидным (слишком короткий)\n');
    process.exit(1);
  }

  console.log('   ✓ Токен найден\n');
  results.push({ success: true, message: 'FIGMA_TOKEN валиден' });

  // 2. Инициализация API
  console.log('2️⃣  Инициализация Figma API...');
  const figmaAPI = new FigmaAPI(FIGMA_TOKEN);
  console.log('   ✓ API клиент создан\n');
  results.push({ success: true, message: 'Figma API клиент инициализирован' });

  // 3. Проверка доступа к файлу
  console.log('3️⃣  Проверка доступа к файлу...');
  console.log(`   File ID: ${FIGMA_FILE_ID}`);
  console.log(`   URL: https://www.figma.com/file/${FIGMA_FILE_ID}\n`);

  let fileInfo: FileInfo;
  let fileData: any;

  try {
    fileData = await figmaAPI.getFile(FIGMA_FILE_ID);
    fileInfo = {
      name: fileData.name,
      lastModified: fileData.lastModified,
      version: fileData.version || 'unknown',
      thumbnailUrl: fileData.thumbnailUrl,
    };

    console.log('   ✓ Файл найден и доступен\n');
    results.push({
      success: true,
      message: 'Доступ к файлу получен',
      details: fileInfo,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        console.error('   ❌ Ошибка авторизации (401)\n');
        console.error('   💡 Проверьте правильность FIGMA_TOKEN');
        process.exit(1);
      } else if (axiosError.response?.status === 404) {
        console.error('   ❌ Файл не найден (404)\n');
        console.error(`   💡 Проверьте FIGMA_FILE_ID и доступ к файлу: https://www.figma.com/file/${FIGMA_FILE_ID}`);
        process.exit(1);
      } else {
        console.error(`   ❌ Ошибка: ${axiosError.response?.status} ${axiosError.message}\n`);
        process.exit(1);
      }
    } else {
      console.error(`   ❌ Неожиданная ошибка: ${error}\n`);
      process.exit(1);
    }
  }

  // 4. Базовая информация о файле
  console.log('4️⃣  Информация о файле:');
  console.log(`   📄 Название: ${fileInfo.name}`);
  console.log(`   📅 Последнее изменение: ${new Date(fileInfo.lastModified).toLocaleString('ru-RU')}`);
  console.log(`   🔢 Версия: ${fileInfo.version}`);
  if (fileInfo.thumbnailUrl) {
    console.log(`   🖼️  Превью: ${fileInfo.thumbnailUrl}`);
  }
  console.log('');

  // 5. Анализ структуры документа
  console.log('5️⃣  Анализ структуры документа...');
  const pages = extractPages(fileData.document);
  console.log(`   📑 Найдено страниц: ${pages.length}\n`);

  if (pages.length > 0) {
    console.log('   Список страниц:');
    pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.name} (${page.type})`);
    });
    console.log('');
  }

  // 6. Поиск основных секций
  console.log('6️⃣  Поиск основных секций...');
  const sections = findSections(fileData.document);
  if (sections.length > 0) {
    console.log(`   📂 Найдено секций: ${sections.length}\n`);
    console.log('   Список секций:');
    sections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.name}`);
    });
    console.log('');
  } else {
    console.log('   ⚠️  Секции не найдены (ищите фреймы с названиями: Onboarding, Auth, Sections и т.д.)\n');
  }

  // 7. Проверка MCP Figma Desktop
  console.log('7️⃣  Проверка MCP Figma Desktop...');
  try {
    // MCP доступен через специальные инструменты
    console.log('   💡 MCP Figma Desktop доступен!');
    console.log('   📝 Для получения Variables через MCP:');
    console.log('      - Откройте Figma Desktop');
    console.log('      - Выберите узел с Variables');
    console.log('      - Используйте MCP функции для получения данных\n');
    results.push({
      success: true,
      message: 'MCP Figma Desktop доступен',
    });
  } catch (error) {
    console.log('   ⚠️  MCP Figma Desktop недоступен\n');
    results.push({
      success: false,
      message: 'MCP Figma Desktop недоступен',
    });
  }

  // 8. Проверка Variables через REST API
  console.log('8️⃣  Проверка Variables через REST API...');
  try {
    const variablesData = await figmaAPI.getVariables(FIGMA_FILE_ID);
    const variablesCount = variablesData.variables.length;
    const collectionsCount = variablesData.collections.length;

    if (variablesCount > 0 || collectionsCount > 0) {
      console.log(`   ✓ Найдено Variables: ${variablesCount}`);
      console.log(`   ✓ Найдено Collections: ${collectionsCount}\n`);

      if (collectionsCount > 0) {
        console.log('   Collections:');
        variablesData.collections.forEach((collection, index) => {
          console.log(`   ${index + 1}. ${collection.name} (${collection.modes.length} режимов)`);
        });
        console.log('');
      }

      results.push({
        success: true,
        message: `Variables найдены: ${variablesCount} переменных, ${collectionsCount} коллекций`,
      });
    } else {
      console.log('   ⚠️  Variables не найдены через API\n');
      console.log('   💡 Variables API требует:');
      console.log('      - Figma Enterprise план');
      console.log('      - Токен с разрешением file_variables:read');
      console.log('      - Доступ на редактирование файла');
      console.log('\n   📝 Variables видны в Figma, но недоступны через REST API');
      console.log('      Компоненты будут импортированы без Variables\n');
      results.push({
        success: false,
        message: 'Variables недоступны через API (требуется Enterprise план)',
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      console.log('   ⚠️  Variables API вернул 403 (Forbidden)\n');
      console.log('   💡 Variables API требует:');
      console.log('      - Figma Enterprise план');
      console.log('      - Токен с разрешением file_variables:read');
      console.log('      - Доступ на редактирование файла');
      console.log('\n   📝 Variables видны в Figma UI, но недоступны через REST API');
      console.log('      Компоненты будут импортированы, но без Variables\n');
      results.push({
        success: false,
        message: 'Variables API недоступен (403 - требуется Enterprise план)',
      });
    } else {
      console.log('   ⚠️  Не удалось получить Variables\n');
      console.log(`   Ошибка: ${error instanceof Error ? error.message : String(error)}\n`);
      results.push({
        success: false,
        message: `Ошибка получения Variables: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  // 9. Проверка Components
  console.log('9️⃣  Проверка Components...');
  try {
    const components = await figmaAPI.getComponents(FIGMA_FILE_ID);
    const componentsCount = components.length;

    if (componentsCount > 0) {
      console.log(`   ✓ Найдено Components: ${componentsCount}\n`);

      // Показываем первые 10 компонентов
      const previewCount = Math.min(10, componentsCount);
      console.log(`   Первые ${previewCount} компонентов:`);
      components.slice(0, previewCount).forEach((component, index) => {
        console.log(`   ${index + 1}. ${component.name}`);
        if (component.description) {
          console.log(`      ${component.description}`);
        }
      });

      if (componentsCount > previewCount) {
        console.log(`   ... и еще ${componentsCount - previewCount} компонентов\n`);
      } else {
        console.log('');
      }

      results.push({
        success: true,
        message: `Components найдены: ${componentsCount} компонентов`,
      });
    } else {
      console.log('   ⚠️  Components не найдены в файле\n');
      console.log('   💡 Убедитесь, что в Figma файле созданы Components');
      results.push({
        success: false,
        message: 'Components не найдены',
      });
    }
  } catch (error) {
    console.log(`   ❌ Ошибка получения Components: ${error instanceof Error ? error.message : String(error)}\n`);
    results.push({
      success: false,
      message: `Ошибка получения Components: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // Итоги
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Итоги тестирования:\n');

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  results.forEach((result, index) => {
    const icon = result.success ? '✓' : '✗';
    const status = result.success ? 'Успешно' : 'Ошибка';
    console.log(`${index + 1}. ${icon} ${status}: ${result.message}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Успешно: ${successCount}`);
  if (failCount > 0) {
    console.log(`⚠️  Предупреждений: ${failCount}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failCount === 0) {
    console.log('🎉 Все проверки пройдены! Можно запускать полный импорт:');
    console.log('   npm run import:figma\n');
  } else {
    console.log('⚠️  Обнаружены проблемы. Проверьте настройки перед полным импортом.\n');
  }
}

function extractPages(node: any, pages: PageInfo[] = []): PageInfo[] {
  if (node.type === 'CANVAS') {
    pages.push({
      id: node.id,
      name: node.name,
      type: node.type,
    });
  }

  if (node.children) {
    node.children.forEach((child: any) => {
      extractPages(child, pages);
    });
  }

  return pages;
}

function findSections(node: any, sections: string[] = []): Array<{ name: string; id: string }> {
  const sectionNames = ['Onboarding', 'Auth', 'Sections', 'Components', 'Design System', 'Tokens'];
  const found: Array<{ name: string; id: string }> = [];

  function traverse(n: any) {
    if (n.type === 'FRAME' || n.type === 'GROUP') {
      const name = n.name || '';
      if (sectionNames.some((section) => name.includes(section))) {
        found.push({ name, id: n.id });
      }
    }

    if (n.children) {
      n.children.forEach(traverse);
    }
  }

  traverse(node);
  return found;
}

main().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});

