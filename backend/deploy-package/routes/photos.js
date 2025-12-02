"use strict";
/**
 * Photo upload routes
 * Image optimization and upload to Yandex Object Storage
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Photo upload routes
 * Image optimization and upload to Yandex Object Storage
 *
 * Note: Install dependencies first: npm install
 */
const express_1 = require("express");
// @ts-ignore - multer types will be available after npm install
const multer_1 = __importDefault(require("multer"));
const logger_1 = require("../logger");
const alerts_1 = require("../alerts");
const imageOptimizer_1 = require("../utils/imageOptimizer");
const validate_1 = require("../validation/validate");
const schemas_1 = require("../validation/schemas");
const objectStorage_1 = require("../services/objectStorage");
const router = (0, express_1.Router)();
// Configure multer for memory storage
// @ts-ignore - multer types will be available after npm install
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (_req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
// Upload and optimize photo
// Note: multer must run before validation to parse multipart/form-data
router.post('/photos', upload.single('photo'), (0, validate_1.validate)({ body: schemas_1.uploadPhotoSchema }), async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Photo file is required',
                    code: 'VALIDATION_ERROR',
                },
            });
        }
        // Optimize image to all sizes
        logger_1.logger.info({
            type: 'photo_upload_start',
            userId,
            originalSize: req.file.size,
            mimetype: req.file.mimetype,
        });
        const optimized = await (0, imageOptimizer_1.generateAllSizes)(req.file.buffer);
        // Upload to Yandex Object Storage
        const timestamp = Date.now();
        const photoKey = `photos/${userId}/${timestamp}`;
        const filesToUpload = [
            {
                key: `${photoKey}/thumbnail.webp`,
                buffer: optimized.thumbnail.webp,
                contentType: 'image/webp',
                metadata: { userId, size: 'thumbnail', format: 'webp' },
            },
            {
                key: `${photoKey}/thumbnail.jpg`,
                buffer: optimized.thumbnail.jpeg,
                contentType: 'image/jpeg',
                metadata: { userId, size: 'thumbnail', format: 'jpeg' },
            },
            {
                key: `${photoKey}/medium.webp`,
                buffer: optimized.medium.webp,
                contentType: 'image/webp',
                metadata: { userId, size: 'medium', format: 'webp' },
            },
            {
                key: `${photoKey}/medium.jpg`,
                buffer: optimized.medium.jpeg,
                contentType: 'image/jpeg',
                metadata: { userId, size: 'medium', format: 'jpeg' },
            },
            {
                key: `${photoKey}/full.webp`,
                buffer: optimized.full.webp,
                contentType: 'image/webp',
                metadata: { userId, size: 'full', format: 'webp' },
            },
            {
                key: `${photoKey}/full.jpg`,
                buffer: optimized.full.jpeg,
                contentType: 'image/jpeg',
                metadata: { userId, size: 'full', format: 'jpeg' },
            },
        ];
        let photoUrls;
        if (objectStorage_1.objectStorageService.isInitialized()) {
            // Upload to Object Storage
            const urls = await objectStorage_1.objectStorageService.uploadFiles(filesToUpload);
            photoUrls = {
                thumbnail: {
                    webp: urls[0],
                    jpeg: urls[1],
                },
                medium: {
                    webp: urls[2],
                    jpeg: urls[3],
                },
                full: {
                    webp: urls[4],
                    jpeg: urls[5],
                },
                blurDataUrl: optimized.full.blurDataUrl,
            };
        }
        else {
            // Fallback: return optimized image data if Object Storage not configured
            logger_1.logger.warn({
                type: 'object_storage_not_available',
                message: 'Object Storage not configured, returning optimized buffers',
            });
            photoUrls = {
                thumbnail: {
                    webp: `data:image/webp;base64,${optimized.thumbnail.webp.toString('base64')}`,
                    jpeg: `data:image/jpeg;base64,${optimized.thumbnail.jpeg.toString('base64')}`,
                },
                medium: {
                    webp: `data:image/webp;base64,${optimized.medium.webp.toString('base64')}`,
                    jpeg: `data:image/jpeg;base64,${optimized.medium.jpeg.toString('base64')}`,
                },
                full: {
                    webp: `data:image/webp;base64,${optimized.full.webp.toString('base64')}`,
                    jpeg: `data:image/jpeg;base64,${optimized.full.jpeg.toString('base64')}`,
                },
                blurDataUrl: optimized.full.blurDataUrl,
            };
        }
        logger_1.logger.info({
            type: 'photo_upload_success',
            userId,
            sizes: {
                thumbnail: optimized.thumbnail.webp.length,
                medium: optimized.medium.webp.length,
                full: optimized.full.webp.length,
            },
        });
        res.json({
            success: true,
            data: {
                photoUrls,
                uploadedAt: new Date(),
            },
        });
    }
    catch (error) {
        // Log and forward to error handler
        if (error instanceof Error) {
            (0, logger_1.logPhotoError)(error, req.body?.userId);
            await (0, alerts_1.sendErrorAlert)('Photo upload failed', error, {
                userId: req.body?.userId,
                service: 'image_optimization',
            });
        }
        next(error);
    }
});
exports.default = router;
