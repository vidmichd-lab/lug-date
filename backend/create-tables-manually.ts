/**
 * Скрипт для создания таблиц migrations вручную
 * Используется когда Query редактор недоступен в консоли
 */

import { Driver, getCredentialsFromEnv } from 'ydb-sdk';
import { resolve } from 'path';
import { existsSync } from 'fs';

async function createTables() {
  // В GitHub Actions используем переменную окружения напрямую
  // Локально ищем файл в родительской директории
  if (!process.env.YC_SERVICE_ACCOUNT_KEY_FILE) {
    const serviceAccountKeyFile = resolve(process.cwd(), '..', 'yc-service-account-key.json');
    if (existsSync(serviceAccountKeyFile)) {
      process.env.YC_SERVICE_ACCOUNT_KEY_FILE = serviceAccountKeyFile;
    }
  }

  const credentials = getCredentialsFromEnv();

  // Используем переменные окружения или значения по умолчанию
  const endpoint = process.env.YDB_ENDPOINT || 'grpcs://ydb.serverless.yandexcloud.net:2135';
  const database =
    process.env.YDB_DATABASE || '/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv';

  // Формируем connection string
  const dbPath = database.startsWith('/') ? database : `/${database}`;
  const separator = endpoint.endsWith('/') ? '?' : '/?';
  const connectionString = `${endpoint}${separator}database=${encodeURIComponent(dbPath)}`;

  console.log(`📊 Endpoint: ${endpoint}`);
  console.log(`📊 Database: ${database}`);

  console.log('🔌 Подключение к YDB...');
  const driver = new Driver({
    connectionString,
    authService: credentials,
  });

  try {
    // Пропускаем ready() проверку - сразу пытаемся выполнить запрос
    console.log('📋 Создание таблицы migrations...');

    try {
      await driver.tableClient.withSessionRetry(async (session) => {
        await session.executeQuery(`
          CREATE TABLE migrations (
            id String NOT NULL,
            name String NOT NULL,
            executed_at Timestamp NOT NULL,
            PRIMARY KEY (id)
          );
        `);
      });
      console.log('✅ Таблица migrations создана успешно!');
    } catch (error: any) {
      if (
        error?.message?.includes('already exists') ||
        error?.message?.includes('ALREADY_EXISTS') ||
        error?.message?.includes('StatusGenericAlreadyExists')
      ) {
        console.log('✅ Таблица migrations уже существует');
      } else {
        console.error('❌ Ошибка при создании migrations:', error.message);
        throw error;
      }
    }

    console.log('📋 Создание таблицы migration_lock...');

    try {
      await driver.tableClient.withSessionRetry(async (session) => {
        await session.executeQuery(`
          CREATE TABLE migration_lock (
            id String NOT NULL,
            locked_at Timestamp NOT NULL,
            locked_by String NOT NULL,
            PRIMARY KEY (id)
          );
        `);
      });
      console.log('✅ Таблица migration_lock создана успешно!');
    } catch (error: any) {
      if (
        error?.message?.includes('already exists') ||
        error?.message?.includes('ALREADY_EXISTS') ||
        error?.message?.includes('StatusGenericAlreadyExists')
      ) {
        console.log('✅ Таблица migration_lock уже существует');
      } else {
        console.error('❌ Ошибка при создании migration_lock:', error.message);
        throw error;
      }
    }

    console.log('\n🎉 Все таблицы готовы! Теперь можно запускать миграции.');
  } catch (error: any) {
    console.error('\n❌ Критическая ошибка:', error.message);
    if (error.message?.includes('timeout')) {
      console.error('\n💡 Подсказка: Запрос завис из-за проблем с сетью.');
      console.error('   Попробуйте:');
      console.error('   1. Проверить доступность порта 2135');
      console.error('   2. Настроить proxy для gRPC');
      console.error(
        '   3. Выполнить миграции из другого окружения (GitHub Actions, Yandex Cloud VM)'
      );
    }
    process.exit(1);
  } finally {
    await driver.destroy();
  }
}

createTables();
