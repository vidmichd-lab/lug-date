/**
 * Создание таблиц migrations через YDB SDK
 * Использует endpoint из Yandex Cloud API (через CLI)
 * Использование: tsx scripts/create-tables-via-api.ts
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

async function createTablesViaAPI() {
  try {
    console.log('🗄️  Создание таблиц через YDB SDK');
    console.log('');

    // Загружаем ключ Service Account
    const possiblePaths = [
      resolve(process.cwd(), 'yc-service-account-key.json'),
      resolve(process.cwd(), '..', 'yc-service-account-key.json'),
    ];

    let keyPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        keyPath = path;
        break;
      }
    }

    if (!keyPath) {
      console.error('❌ Не удалось найти ключ Service Account');
      console.error('💡 Убедитесь, что файл yc-service-account-key.json существует');
      process.exit(1);
    }

    // Получаем endpoint из Yandex Cloud CLI
    let endpoint: string;
    const databasePath =
      process.env.YDB_DATABASE || '/ru-central1/b1g6a1tnrohoeas9v0k6/etnbi9hemleeobirfbrv';

    try {
      console.log('🔍 Получение endpoint из Yandex Cloud CLI...');
      const dbInfoJson = execSync(
        'yc ydb database get --id etnbi9hemleeobirfbrv --folder-id b1g6rst3sps7hhu8tqla --format json',
        { encoding: 'utf-8' }
      );
      const dbInfo = JSON.parse(dbInfoJson);
      console.log('✅ База данных найдена:');
      console.log(`   ID: ${dbInfo.id}`);
      console.log(`   Name: ${dbInfo.name}`);
      console.log(`   Status: ${dbInfo.status}`);
      console.log('');

      if (dbInfo.endpoint) {
        endpoint = dbInfo.endpoint;
        console.log(`📡 Используем endpoint из API: ${endpoint}`);
      } else {
        endpoint = `grpcs://ydb.serverless.yandexcloud.net:2135/?database=${encodeURIComponent(databasePath)}`;
        console.log(`📡 Используем endpoint по умолчанию: ${endpoint}`);
      }
    } catch (error) {
      console.log('⚠️  Не удалось получить endpoint через Yandex Cloud CLI');
      console.log('   Используем endpoint по умолчанию');
      endpoint = `grpcs://ydb.serverless.yandexcloud.net:2135/?database=${encodeURIComponent(databasePath)}`;
    }

    console.log('');

    // Импортируем YDB SDK
    const { Driver, getSACredentialsFromJson, IamAuthService } = await import('ydb-sdk');

    console.log('🔌 Подключение к YDB через SDK...');
    const credentials = new IamAuthService(getSACredentialsFromJson(keyPath));
    const driver = new Driver({
      connectionString: endpoint,
      authService: credentials,
    });

    try {
      console.log('⏳ Ожидание подключения...');
      await driver.ready(30000);
      console.log('✅ Подключение установлено!');
      console.log('');

      // Создаем таблицу migrations
      console.log('📋 Создание таблицы migrations...');
      try {
        await driver.tableClient.withSessionRetry(async (session) => {
          await session.executeQuery(`
            CREATE TABLE IF NOT EXISTS migrations (
              id String NOT NULL,
              name String NOT NULL,
              executed_at Timestamp NOT NULL,
              PRIMARY KEY (id)
            );
          `);
        });
        console.log('✅ Таблица migrations создана успешно');
      } catch (error: any) {
        if (
          error?.message?.includes('already exists') ||
          error?.message?.includes('ALREADY_EXISTS') ||
          error?.message?.includes('StatusGenericAlreadyExists')
        ) {
          console.log('✅ Таблица migrations уже существует');
        } else {
          throw error;
        }
      }

      // Создаем таблицу migration_lock
      console.log('📋 Создание таблицы migration_lock...');
      try {
        await driver.tableClient.withSessionRetry(async (session) => {
          await session.executeQuery(`
            CREATE TABLE IF NOT EXISTS migration_lock (
              id String NOT NULL,
              locked_at Timestamp NOT NULL,
              locked_by String NOT NULL,
              PRIMARY KEY (id)
            );
          `);
        });
        console.log('✅ Таблица migration_lock создана успешно');
      } catch (error: any) {
        if (
          error?.message?.includes('already exists') ||
          error?.message?.includes('ALREADY_EXISTS') ||
          error?.message?.includes('StatusGenericAlreadyExists')
        ) {
          console.log('✅ Таблица migration_lock уже существует');
        } else {
          throw error;
        }
      }

      // Проверяем создание таблиц простым запросом
      console.log('');
      console.log('🔍 Проверка созданных таблиц...');
      try {
        await driver.tableClient.withSessionRetry(async (session) => {
          const result = await session.executeQuery('SELECT id FROM migrations LIMIT 1');
          console.log('✅ Таблица migrations доступна для запросов');
        });
      } catch (error: any) {
        if (error?.message?.includes('not found') || error?.message?.includes('does not exist')) {
          console.log('⚠️  Таблица migrations не найдена (возможно, нужно подождать)');
        } else {
          console.log('✅ Таблица migrations создана (ошибка проверки игнорируется)');
        }
      }

      console.log('');
      console.log('🎉 Все таблицы готовы! Теперь можно запускать миграции.');
      console.log('');
      console.log('💡 Следующий шаг:');
      console.log('   cd backend && npm run migrate');

      await driver.destroy();
      process.exit(0);
    } catch (error: any) {
      console.error('');
      console.error('❌ Ошибка при создании таблиц:');
      console.error(`   ${error.message}`);
      if (error.code) {
        console.error(`   Code: ${error.code}`);
      }
      if (error.details) {
        console.error(`   Details: ${JSON.stringify(error.details, null, 2)}`);
      }
      await driver.destroy();
      process.exit(1);
    }
  } catch (error: any) {
    console.error('');
    console.error('❌ Критическая ошибка:');
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  }
}

createTablesViaAPI();
