/**
 * Yandex Object Storage Service
 * Handles file uploads to Yandex Object Storage (S3-compatible)
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../logger';

interface ObjectStorageConfig {
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region?: string;
}

class ObjectStorageService {
  private s3Client: S3Client | null = null;
  private config: ObjectStorageConfig | null = null;

  /**
   * Initialize Object Storage client
   */
  initialize(): void {
    const bucket = process.env.YANDEX_STORAGE_BUCKET;
    const accessKeyId = process.env.YANDEX_STORAGE_ACCESS_KEY;
    const secretAccessKey = process.env.YANDEX_STORAGE_SECRET_KEY;
    const endpoint = process.env.OBJECT_STORAGE_URL || 'https://storage.yandexcloud.net';

    if (!bucket || !accessKeyId || !secretAccessKey) {
      logger.warn({
        type: 'object_storage_not_configured',
        message: 'Object Storage credentials not found. File uploads will not work.',
      });
      return;
    }

    this.config = {
      bucket,
      accessKeyId,
      secretAccessKey,
      endpoint,
      region: 'ru-central1', // Default Yandex Cloud region
    };

    // Initialize S3 client for Yandex Object Storage
    this.s3Client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      // Yandex Object Storage uses path-style addressing
      forcePathStyle: true,
    });

    logger.info({
      type: 'object_storage_initialized',
      bucket: this.config.bucket,
    });
  }

  /**
   * Upload file to Object Storage
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    if (!this.s3Client || !this.config) {
      throw new Error('Object Storage not initialized');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);

      // Return public URL
      const url = `${this.config.endpoint}/${this.config.bucket}/${key}`;
      
      logger.info({
        type: 'object_storage_upload_success',
        key,
        contentType,
      });

      return url;
    } catch (error) {
      logger.error({
        error,
        type: 'object_storage_upload_failed',
        key,
      });
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Array<{ key: string; buffer: Buffer; contentType: string; metadata?: Record<string, string> }>
  ): Promise<string[]> {
    const uploads = files.map((file) =>
      this.uploadFile(file.key, file.buffer, file.contentType, file.metadata)
    );

    return Promise.all(uploads);
  }

  /**
   * Generate presigned URL for file access
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3Client || !this.config) {
      throw new Error('Object Storage not initialized');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error({
        error,
        type: 'object_storage_presigned_url_failed',
        key,
      });
      throw error;
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.s3Client !== null && this.config !== null;
  }
}

// Export singleton instance
export const objectStorageService = new ObjectStorageService();

/**
 * Initialize Object Storage on app start
 */
export function initObjectStorage(): void {
  objectStorageService.initialize();
}

