/**
 * Test script for Object Storage upload
 * Usage: npm run test:storage
 * 
 * This script tests uploading a test image to Yandex Object Storage
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { objectStorageService, initObjectStorage } from '../backend/src/services/objectStorage';

// Load environment variables
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function testObjectStorage() {
  console.log('🧪 Testing Object Storage upload...\n');

  // Initialize Object Storage
  initObjectStorage();

  if (!objectStorageService.isInitialized()) {
    console.error('❌ Object Storage is not initialized!');
    console.error('   Please check your .env file:');
    console.error('   - YANDEX_STORAGE_BUCKET');
    console.error('   - YANDEX_STORAGE_ACCESS_KEY');
    console.error('   - YANDEX_STORAGE_SECRET_KEY');
    process.exit(1);
  }

  console.log('✅ Object Storage initialized\n');

  try {
    // Create a simple test image (1x1 pixel PNG)
    // In a real scenario, you would read an actual image file
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const testKey = `test/${Date.now()}-test-image.png`;

    console.log(`📤 Uploading test image to: ${testKey}`);

    // Upload test image
    const url = await objectStorageService.uploadFile(
      testKey,
      testImageBuffer,
      'image/png',
      {
        test: 'true',
        uploadedAt: new Date().toISOString(),
      }
    );

    console.log('✅ Upload successful!');
    console.log(`   URL: ${url}\n`);

    // Test presigned URL generation
    console.log('🔗 Generating presigned URL...');
    const presignedUrl = await objectStorageService.getPresignedUrl(testKey, 3600);
    console.log('✅ Presigned URL generated:');
    console.log(`   ${presignedUrl}\n`);

    console.log('✅ All tests passed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check the uploaded file in Yandex Object Storage console');
    console.log('   2. Test accessing the file via the URL');
    console.log('   3. Test the presigned URL (valid for 1 hour)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

testObjectStorage();



