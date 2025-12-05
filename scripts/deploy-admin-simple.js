/**
 * Simple deployment script for admin (pure Node.js, no TypeScript)
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { readdir, readFile, writeFile } = require('fs/promises');
const { join, relative } = require('path');
const { existsSync } = require('fs');
require('dotenv').config();

function getConfig() {
  const bucket = process.env.ADMIN_STORAGE_BUCKET_DEV || 
                 process.env.ADMIN_STORAGE_BUCKET || 
                 'lug-admin-deploy';
  const accessKeyId = process.env.ADMIN_STORAGE_ACCESS_KEY_DEV || 
                      process.env.ADMIN_STORAGE_ACCESS_KEY;
  const secretAccessKey = process.env.ADMIN_STORAGE_SECRET_KEY_DEV || 
                          process.env.ADMIN_STORAGE_SECRET_KEY;
  const endpoint = process.env.OBJECT_STORAGE_URL || 'https://storage.yandexcloud.net';
  const sourceDir = process.env.ADMIN_DIST_PATH || join(process.cwd(), 'admin', 'dist');

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'Object Storage credentials not found. Please set:\n' +
      '  ADMIN_STORAGE_ACCESS_KEY_DEV (or ADMIN_STORAGE_ACCESS_KEY)\n' +
      '  ADMIN_STORAGE_SECRET_KEY_DEV (or ADMIN_STORAGE_SECRET_KEY)'
    );
  }

  if (!existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}\nPlease build admin first.`);
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

async function getAllFiles(dir, baseDir = dir) {
  const files = [];
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

function getContentType(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypes = {
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

  return contentTypes[ext] || 'application/octet-stream';
}

async function uploadFile(s3Client, bucket, filePath, key) {
  const fileContent = await readFile(filePath);
  const contentType = getContentType(filePath);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: key.includes('assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
  });

  await s3Client.send(command);
}

async function clearBucket(s3Client, bucket) {
  console.log('🗑️  Clearing existing files from bucket...');
  
  let continuationToken;
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

async function deploy() {
  try {
    console.log('🚀 Starting admin deployment to Yandex Object Storage...\n');

    const config = getConfig();
    console.log(`📦 Bucket: ${config.bucket}`);
    console.log(`📁 Source: ${config.sourceDir}\n`);

    const s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });

    if (config.clearBeforeUpload) {
      await clearBucket(s3Client, config.bucket);
    }

    // Update config.js with backend URL if provided
    const backendUrl = process.env.BACKEND_URL || process.env.VITE_API_URL;
    if (backendUrl) {
      const configJsPath = join(config.sourceDir, 'config.js');
      const configContent = `// Runtime configuration for admin panel
// Auto-generated during deployment
window.ADMIN_CONFIG = window.ADMIN_CONFIG || {
  API_URL: '${backendUrl}'
};
`;
      await writeFile(configJsPath, configContent, 'utf-8');
      console.log(`✅ Updated config.js with backend URL: ${backendUrl}\n`);
    }

    console.log('📋 Scanning files...');
    const files = await getAllFiles(config.sourceDir);
    console.log(`✅ Found ${files.length} files to upload\n`);

    console.log('📤 Uploading files...');
    let uploadedCount = 0;
    let failedCount = 0;

    for (const filePath of files) {
      try {
        const relativePath = relative(config.sourceDir, filePath);
        const key = relativePath.replace(/\\/g, '/');

        await uploadFile(s3Client, config.bucket, filePath, key);
        console.log(`  ✅ ${key}`);
        uploadedCount++;
      } catch (error) {
        console.error(`  ❌ ${filePath}:`, error.message);
        failedCount++;
      }
    }

    console.log(`\n✨ Deployment complete!`);
    console.log(`   ✅ Uploaded: ${uploadedCount} files`);
    if (failedCount > 0) {
      console.log(`   ❌ Failed: ${failedCount} files`);
    }

    const bucketUrl = `https://storage.yandexcloud.net/${config.bucket}/`;
    const websiteUrl = `https://${config.bucket}.website.yandexcloud.net/`;
    
    console.log(`\n🌐 URLs:`);
    console.log(`   Storage: ${bucketUrl}`);
    console.log(`   Website: ${websiteUrl}`);
    console.log(`\n💡 Admin panel available at: ${websiteUrl}`);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();

