/**
 * Photo upload routes
 * Image optimization and upload to Yandex Object Storage
 */

/**
 * Photo upload routes
 * Image optimization and upload to Yandex Object Storage
 * 
 * Note: Install dependencies first: npm install
 */

import { Router, Request, Response, NextFunction } from 'express';
// @ts-expect-error - multer types will be available after npm install
import multer from 'multer';
import { logPhotoError, logger } from '../logger';
import { sendErrorAlert } from '../alerts';
import { generateAllSizes } from '../utils/imageOptimizer';
import { validate } from '../validation/validate';
import { uploadPhotoSchema } from '../validation/schemas';
import { objectStorageService } from '../services/objectStorage';

const router = Router();

// Extend Request type to include file
interface MulterRequest extends Omit<Request, 'file'> {
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
}

// Configure multer for memory storage
// @ts-expect-error - multer types will be available after npm install
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req: Request, file: any, cb: any) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload and optimize photo
// Note: multer must run before validation to parse multipart/form-data
router.post('/photos', upload.single('photo'), validate({ body: uploadPhotoSchema }), async (req: MulterRequest, res: Response, next: NextFunction) => {
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
    logger.info({
      type: 'photo_upload_start',
      userId,
      originalSize: req.file.size,
      mimetype: req.file.mimetype,
    });

    const optimized = await generateAllSizes(req.file.buffer);

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
    
    if (objectStorageService.isInitialized()) {
      // Upload to Object Storage
      const urls = await objectStorageService.uploadFiles(filesToUpload);
      
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
    } else {
      // Fallback: return optimized image data if Object Storage not configured
      logger.warn({
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

    logger.info({
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
  } catch (error) {
    // Log and forward to error handler
    if (error instanceof Error) {
      logPhotoError(error, req.body?.userId);
      await sendErrorAlert('Photo upload failed', error, {
        userId: req.body?.userId,
        service: 'image_optimization',
      });
    }
    next(error);
  }
});

export default router;

