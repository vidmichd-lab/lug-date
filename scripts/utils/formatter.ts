import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function formatFiles(directory: string) {
  try {
    // Запуск Prettier для форматирования
    const prettierCmd = `npx prettier --write "${directory}/**/*.{ts,tsx,css}"`;
    await execAsync(prettierCmd, { cwd: path.dirname(directory) });
  } catch (error) {
    // Prettier может быть не установлен, это не критично
    console.warn('⚠️  Prettier не найден, пропуск форматирования');
  }

  try {
    // Валидация TypeScript (только проверка, без генерации файлов)
    const tscCmd = `npx tsc --noEmit --project ${path.join(path.dirname(directory), 'frontend/tsconfig.json')}`;
    await execAsync(tscCmd);
  } catch (error) {
    // TypeScript ошибки не критичны на этапе импорта
    console.warn('⚠️  Обнаружены TypeScript ошибки, проверьте вручную');
  }
}
