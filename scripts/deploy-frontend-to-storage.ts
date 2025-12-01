/**
 * Script to deploy frontend build to Yandex Object Storage
 * Automatically uploads files from frontend/dist/ to Object Storage bucket
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

interface DeployConfig {
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
  sourceDir: string;
  clearBeforeUpload?: boolean;
}

function getConfig(): DeployConfig {
  // Try frontend-specific secrets first, then fallback to general ones
  const bucket = process.env.FRONTEND_STORAGE_BUCKET || 
                 process.env.FRONTEND_STORAGE_BUCKET_DEV || 
                 process.env.YANDEX_STORAGE_BUCKET || 
                 process.env.YANDEX_STORAGE_BUCKET_DEV;
  const accessKeyId = process.env.FRONTEND_STORAGE_ACCESS_KEY || 
                      process.env.FRONTEND_STORAGE_ACCESS_KEY_DEV || 
                      process.env.YANDEX_STORAGE_ACCESS_KEY || 
                      process.env.YANDEX_STORAGE_ACCESS_KEY_DEV;
  const secretAccessKey = process.env.FRONTEND_STORAGE_SECRET_KEY || 
                          process.env.FRONTEND_STORAGE_SECRET_KEY_DEV || 
                          process.env.YANDEX_STORAGE_SECRET_KEY || 
                          process.env.YANDEX_STORAGE_SECRET_KEY_DEV;
  const endpoint = process.env.OBJECT_STORAGE_URL || 'https://storage.yandexcloud.net';
  const sourceDir = process.env.FRONTEND_DIST_PATH || join(process.cwd(), 'frontend', 'dist');

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Object Storage credentials not found. Please set:\n' +
      '  FRONTEND_STORAGE_BUCKET_DEV (or YANDEX_STORAGE_BUCKET_DEV)\n' +
      '  FRONTEND_STORAGE_ACCESS_KEY_DEV (or YANDEX_STORAGE_ACCESS_KEY_DEV)\n' +
      '  FRONTEND_STORAGE_SECRET_KEY_DEV (or YANDEX_STORAGE_SECRET_KEY_DEV)\n' +
      '\n' +
      'For GitHub Actions, use FRONTEND_STORAGE_* secrets.'
    );
  }

  if (!existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}\nPlease build frontend first: npm run build:frontend`);
  }

  return {
    bucket,
    accessKeyId,
    secretAccessKey,
    endpoint,
    region: 'ru-central1',
    sourceDir,
    clearBeforeUpload: process.env.CLEAR_BUCKET_BEFORE_UPLOAD === 'true',
  };
}

async function getAllFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function uploadFile(
  s3Client: S3Client,
  bucket: string,
  filePath: string,
  key: string
): Promise<void> {
  const fileContent = await readFile(filePath);
  const contentType = getContentType(filePath);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    // Cache control for static assets
    CacheControl: key.includes('assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
  });

  await s3Client.send(command);
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    js: 'application/javascript',
    css: 'text/css',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
  };

  return contentTypes[ext || ''] || 'application/octet-stream';
}

async function clearBucket(s3Client: S3Client, bucket: string): Promise<void> {
  console.log('🗑️  Clearing existing files from bucket...');
  
  let continuationToken: string | undefined;
  let deletedCount = 0;

  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(listCommand);
    const objects = response.Contents || [];

    for (const object of objects) {
      if (object.Key) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucket,
          Key: object.Key,
        });
        await s3Client.send(deleteCommand);
        deletedCount++;
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  console.log(`✅ Deleted ${deletedCount} files from bucket`);
}

async function deploy(): Promise<void> {
  try {
    console.log('🚀 Starting frontend deployment to Yandex Object Storage...\n');

    const config = getConfig();
    console.log(`📦 Bucket: ${config.bucket}`);
    console.log(`📁 Source: ${config.sourceDir}\n`);

    // Initialize S3 client
    const s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for Yandex Object Storage
    });

    // Clear bucket if needed
    if (config.clearBeforeUpload) {
      await clearBucket(s3Client, config.bucket);
    }

    // Get all files to upload
    console.log('📋 Scanning files...');
    const files = await getAllFiles(config.sourceDir);
    console.log(`✅ Found ${files.length} files to upload\n`);

    // Upload files
    console.log('📤 Uploading files...');
    let uploadedCount = 0;
    let failedCount = 0;

    for (const filePath of files) {
      try {
        const relativePath = relative(config.sourceDir, filePath);
        const key = relativePath.replace(/\\/g, '/'); // Normalize path separators

        await uploadFile(s3Client, config.bucket, filePath, key);
        console.log(`  ✅ ${key}`);
        uploadedCount++;
      } catch (error) {
        console.error(`  ❌ ${filePath}:`, error instanceof Error ? error.message : error);
        failedCount++;
      }
    }

    console.log(`\n✨ Deployment complete!`);
    console.log(`   ✅ Uploaded: ${uploadedCount} files`);
    if (failedCount > 0) {
      console.log(`   ❌ Failed: ${failedCount} files`);
    }

    // Get bucket URL
    const bucketUrl = `https://storage.yandexcloud.net/${config.bucket}/`;
    const websiteUrl = `https://${config.bucket}.website.yandexcloud.net/`;
    
    console.log(`\n🌐 URLs:`);
    console.log(`   Storage: ${bucketUrl}`);
    console.log(`   Website: ${websiteUrl}`);
    console.log(`\n💡 Use the website URL in BotFather: ${websiteUrl}`);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run deployment
deploy();

