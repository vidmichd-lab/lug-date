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
// @ts-ignore - multer types will be available after npm install
import multer from 'multer';
import { logPhotoError, logger } from '../logger';
import { sendErrorAlert } from '../alerts';
import { generateAllSizes } from '../utils/imageOptimizer';

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
// @ts-ignore - multer types will be available after npm install
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
router.post('/photos', upload.single('photo'), async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Photo file is required',
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

    // TODO: Upload to Yandex Object Storage
    // For now, return optimized image data
    const photoUrls = {
      thumbnail: {
        webp: `https://cdn.example.com/photos/${userId}/thumbnail.webp`,
        jpeg: `https://cdn.example.com/photos/${userId}/thumbnail.jpg`,
      },
      medium: {
        webp: `https://cdn.example.com/photos/${userId}/medium.webp`,
        jpeg: `https://cdn.example.com/photos/${userId}/medium.jpg`,
      },
      full: {
        webp: `https://cdn.example.com/photos/${userId}/full.webp`,
        jpeg: `https://cdn.example.com/photos/${userId}/full.jpg`,
      },
      blurDataUrl: optimized.full.blurDataUrl,
    };

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

