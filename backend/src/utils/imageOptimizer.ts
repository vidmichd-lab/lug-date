/**
 * Image optimization using Sharp
 * Generates multiple sizes and formats (WebP, JPEG)
 */

import sharp from 'sharp';
import { logError } from '../logger';

export interface ImageSizes {
  thumbnail: { width: number; height: number };
  medium: { width: number; height: number };
  full: { width: number; height: number };
}

export const IMAGE_SIZES: ImageSizes = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 600, height: 600 },
  full: { width: 1200, height: 1200 },
};

export interface OptimizedImage {
  webp: Buffer;
  jpeg: Buffer;
  blurDataUrl?: string;
  width: number;
  height: number;
}

/**
 * Generate blur placeholder (base64)
 */
async function generateBlurPlaceholder(imageBuffer: Buffer): Promise<string> {
  try {
    const blur = await sharp(imageBuffer)
      .resize(20, 20, { fit: 'inside' })
      .webp({ quality: 20 })
      .toBuffer();

    return `data:image/webp;base64,${blur.toString('base64')}`;
  } catch (error) {
    logError(error as Error, { type: 'blur_placeholder_generation' });
    return '';
  }
}

/**
 * Optimize image to WebP format
 */
async function optimizeToWebP(
  imageBuffer: Buffer,
  width: number,
  height: number,
  quality: number = 80
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();
}

/**
 * Optimize image to JPEG format (fallback)
 */
async function optimizeToJPEG(
  imageBuffer: Buffer,
  width: number,
  height: number,
  quality: number = 85
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality, progressive: true })
    .toBuffer();
}

/**
 * Optimize image for all sizes
 */
export async function optimizeImage(
  imageBuffer: Buffer,
  size: keyof ImageSizes = 'full'
): Promise<OptimizedImage> {
  try {
    const dimensions = IMAGE_SIZES[size];
    const metadata = await sharp(imageBuffer).metadata();

    // Generate blur placeholder
    const blurDataUrl = await generateBlurPlaceholder(imageBuffer);

    // Optimize to WebP (primary format)
    const webp = await optimizeToWebP(imageBuffer, dimensions.width, dimensions.height);

    // Optimize to JPEG (fallback)
    const jpeg = await optimizeToJPEG(imageBuffer, dimensions.width, dimensions.height);

    return {
      webp,
      jpeg,
      blurDataUrl,
      width: metadata.width || dimensions.width,
      height: metadata.height || dimensions.height,
    };
  } catch (error) {
    logError(error as Error, { type: 'image_optimization', size });
    throw error;
  }
}

/**
 * Generate all sizes for an image
 */
export async function generateAllSizes(imageBuffer: Buffer): Promise<{
  thumbnail: OptimizedImage;
  medium: OptimizedImage;
  full: OptimizedImage;
}> {
  const [thumbnail, medium, full] = await Promise.all([
    optimizeImage(imageBuffer, 'thumbnail'),
    optimizeImage(imageBuffer, 'medium'),
    optimizeImage(imageBuffer, 'full'),
  ]);

  return { thumbnail, medium, full };
}
