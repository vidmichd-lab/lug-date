/**
 * Создание базы данных YDB через Yandex Cloud API
 * Использование: tsx scripts/create-ydb-via-api.ts
 */

import { YDB } from '@yandex-cloud/nodejs-sdk';
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface ServiceAccountKey {
  service_account_id: string;
  id: string;
  private_key: string;
}

async function createYDBDatabase() {
  try {
    // Загружаем ключ Service Account
    const keyPath = resolve(process.cwd(), 'yc-service-account-key.json');
    let serviceAccountKey: ServiceAccountKey;

    try {
      const keyContent = readFileSync(keyPath, 'utf-8');
      serviceAccountKey = JSON.parse(keyContent);
    } catch (error) {
      console.error('❌ Не удалось загрузить ключ Service Account');
      console.error(`   Путь: ${keyPath}`);
      console.error('💡 Убедитесь, что файл yc-service-account-key.json существует');
      process.exit(1);
    }

    // Параметры
    const folderId = process.env.FOLDER_ID || 'b1g6rst3sps7hhu8tqla';
    const dbName = process.env.DB_NAME || 'lug-dating-db';
    const dbId = process.env.DB_ID || 'etnbi9hemleeobirfbrv';

    console.log('🗄️  Создание базы данных YDB через API');
    console.log('');
    console.log('📋 Параметры:');
    console.log(`   Folder ID: ${folderId}`);
    console.log(`   Database Name: ${dbName}`);
    console.log(`   Database ID: ${dbId}`);
    console.log('');

    // Инициализируем SDK
    const sdk = new YDB.SDK({
      serviceAccountJson: serviceAccountKey,
    });

    const ydbService = sdk.ydb().database();

    // Проверяем, существует ли база данных
    console.log('🔍 Проверка существования базы данных...');
    try {
      const existingDb = await ydbService.get({
        databaseId: dbId,
        folderId,
      });

      console.log('✅ База данных уже существует');
      console.log('');
      console.log('📊 Информация:');
      console.log(`   ID: ${existingDb.id}`);
      console.log(`   Name: ${existingDb.name}`);
      console.log(`   Status: ${existingDb.status}`);
      console.log(`   Endpoint: ${existingDb.endpoint}`);
      console.log(`   Path: ${existingDb.databasePath}`);
      console.log('');
      return;
    } catch (error: any) {
      if (error.code === 5 || error.message?.includes('not found')) {
        console.log('ℹ️  База данных не найдена, создаём новую...');
      } else {
        throw error;
      }
    }

    // Создаём базу данных
    console.log('🔄 Создание базы данных...');
    const operation = await ydbService.create({
      folderId,
      name: dbName,
      serverlessDatabase: {
        // Serverless база данных
      },
    });

    console.log('⏳ Ожидание завершения операции...');
    const result = await operation;

    if (result.response) {
      console.log('✅ База данных создана успешно!');
      console.log('');
      console.log('📊 Информация:');
      console.log(`   ID: ${result.response.id}`);
      console.log(`   Name: ${result.response.name}`);
      console.log(`   Endpoint: ${result.response.endpoint}`);
      console.log(`   Path: ${result.response.databasePath}`);
      console.log('');
      console.log('💡 Обновите секрет YDB_DATABASE в GitHub:');
      console.log(`   ${result.response.databasePath}`);
    }
  } catch (error: any) {
    console.error('❌ Ошибка при создании базы данных:');
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.details) {
      console.error(`   Details: ${JSON.stringify(error.details, null, 2)}`);
    }
    process.exit(1);
  }
}

createYDBDatabase();
