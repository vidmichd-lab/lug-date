"use strict";
/**
 * Yandex Object Storage Service
 * Handles file uploads to Yandex Object Storage (S3-compatible)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectStorageService = void 0;
exports.initObjectStorage = initObjectStorage;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const logger_1 = require("../logger");
class ObjectStorageService {
    constructor() {
        this.s3Client = null;
        this.config = null;
    }
    /**
     * Initialize Object Storage client
     */
    initialize() {
        const bucket = process.env.YANDEX_STORAGE_BUCKET;
        const accessKeyId = process.env.YANDEX_STORAGE_ACCESS_KEY;
        const secretAccessKey = process.env.YANDEX_STORAGE_SECRET_KEY;
        const endpoint = process.env.OBJECT_STORAGE_URL || 'https://storage.yandexcloud.net';
        if (!bucket || !accessKeyId || !secretAccessKey) {
            logger_1.logger.warn({
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
        this.s3Client = new client_s3_1.S3Client({
            endpoint: this.config.endpoint,
            region: this.config.region,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
            },
            // Yandex Object Storage uses path-style addressing
            forcePathStyle: true,
        });
        logger_1.logger.info({
            type: 'object_storage_initialized',
            bucket: this.config.bucket,
        });
    }
    /**
     * Upload file to Object Storage
     */
    async uploadFile(key, buffer, contentType, metadata) {
        if (!this.s3Client || !this.config) {
            throw new Error('Object Storage not initialized');
        }
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.config.bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                Metadata: metadata,
            });
            await this.s3Client.send(command);
            // Return public URL
            const url = `${this.config.endpoint}/${this.config.bucket}/${key}`;
            logger_1.logger.info({
                type: 'object_storage_upload_success',
                key,
                contentType,
            });
            return url;
        }
        catch (error) {
            logger_1.logger.error({
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
    async uploadFiles(files) {
        const uploads = files.map((file) => this.uploadFile(file.key, file.buffer, file.contentType, file.metadata));
        return Promise.all(uploads);
    }
    /**
     * Generate presigned URL for file access
     */
    async getPresignedUrl(key, expiresIn = 3600) {
        if (!this.s3Client || !this.config) {
            throw new Error('Object Storage not initialized');
        }
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.config.bucket,
                Key: key,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            return url;
        }
        catch (error) {
            logger_1.logger.error({
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
    isInitialized() {
        return this.s3Client !== null && this.config !== null;
    }
}
// Export singleton instance
exports.objectStorageService = new ObjectStorageService();
/**
 * Initialize Object Storage on app start
 */
function initObjectStorage() {
    exports.objectStorageService.initialize();
}
