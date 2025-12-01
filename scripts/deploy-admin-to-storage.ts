/**
 * Script to deploy admin build to Yandex Object Storage
 * Automatically uploads files from admin/dist/ to Object Storage bucket
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile, writeFile, stat } from 'fs/promises';
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
  // Try admin-specific secrets first, then fallback to general ones
  // Priority: ADMIN_STORAGE_BUCKET_DEV > ADMIN_STORAGE_BUCKET > default
  const bucket = process.env.ADMIN_STORAGE_BUCKET_DEV || 
                 process.env.ADMIN_STORAGE_BUCKET || 
                 'lug-admin-deploy'; // Default bucket name from user
  // Priority: ADMIN_STORAGE_ACCESS_KEY_DEV > ADMIN_STORAGE_ACCESS_KEY > default
  const accessKeyId = process.env.ADMIN_STORAGE_ACCESS_KEY_DEV || 
                      process.env.ADMIN_STORAGE_ACCESS_KEY || 
                      'YCAJEgizqc8bY5Q14h1NHXd6R'; // From user - admin-deploy service account
  const secretAccessKey = process.env.ADMIN_STORAGE_SECRET_KEY_DEV || 
                          process.env.ADMIN_STORAGE_SECRET_KEY || 
                          'YCMZZX-xGsejY9LZSH6DMY6yPJbegkB5-Csxr8oU'; // From user - admin-deploy service account
  // Yandex Object Storage endpoint - must use storage.yandexcloud.net
  const endpoint = process.env.OBJECT_STORAGE_URL || 'https://storage.yandexcloud.net';
  const sourceDir = process.env.ADMIN_DIST_PATH || join(process.cwd(), 'admin', 'dist');

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'Object Storage credentials not found. Please set:\n' +
      '  ADMIN_STORAGE_ACCESS_KEY_DEV (or YANDEX_STORAGE_ACCESS_KEY)\n' +
      '  ADMIN_STORAGE_SECRET_KEY_DEV (or YANDEX_STORAGE_SECRET_KEY)\n' +
      '\n' +
      'Bucket will use: ' + bucket + '\n' +
      'For GitHub Actions, use ADMIN_STORAGE_* secrets.'
    );
  }
  
  console.log('🔑 Using credentials:');
  console.log(`   Bucket: ${bucket}`);
  console.log(`   Access Key: ${accessKeyId.substring(0, 10)}...`);
  console.log(`   Endpoint: ${endpoint}\n`);

  if (!existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}\nPlease build admin first: npm run build:admin`);
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
    console.log('🚀 Starting admin deployment to Yandex Object Storage...\n');

    const config = getConfig();
    console.log(`📦 Bucket: ${config.bucket}`);
    console.log(`📁 Source: ${config.sourceDir}\n`);

    // Initialize S3 client for Yandex Object Storage
    const s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for Yandex Object Storage
      // Disable SSL verification if needed (not recommended for production)
      // tls: false,
    });

    // Clear bucket if needed
    if (config.clearBeforeUpload) {
      await clearBucket(s3Client, config.bucket);
    }

    // Update config.js with backend URL if provided
    const backendUrl = process.env.BACKEND_URL || process.env.VITE_API_URL;
    if (backendUrl) {
      const configJsPath = join(config.sourceDir, 'config.js');
      // Create or update config.js
      const configContent = `// Runtime configuration for admin panel
// Auto-generated during deployment
window.ADMIN_CONFIG = window.ADMIN_CONFIG || {
  API_URL: '${backendUrl}'
};
`;
      await writeFile(configJsPath, configContent, 'utf-8');
      console.log(`✅ Updated config.js with backend URL: ${backendUrl}\n`);
    } else {
      console.log('⚠️  No BACKEND_URL provided, using default from config.js\n');
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
    console.log(`\n💡 Admin panel available at: ${websiteUrl}`);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run deployment
deploy();

