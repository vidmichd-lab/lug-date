"use strict";
/**
 * Image optimization using Sharp
 * Generates multiple sizes and formats (WebP, JPEG)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGE_SIZES = void 0;
exports.optimizeImage = optimizeImage;
exports.generateAllSizes = generateAllSizes;
const sharp_1 = __importDefault(require("sharp"));
const logger_1 = require("../logger");
exports.IMAGE_SIZES = {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 600, height: 600 },
    full: { width: 1200, height: 1200 },
};
/**
 * Generate blur placeholder (base64)
 */
async function generateBlurPlaceholder(imageBuffer) {
    try {
        const blur = await (0, sharp_1.default)(imageBuffer)
            .resize(20, 20, { fit: 'inside' })
            .webp({ quality: 20 })
            .toBuffer();
        return `data:image/webp;base64,${blur.toString('base64')}`;
    }
    catch (error) {
        (0, logger_1.logError)(error, { type: 'blur_placeholder_generation' });
        return '';
    }
}
/**
 * Optimize image to WebP format
 */
async function optimizeToWebP(imageBuffer, width, height, quality = 80) {
    return (0, sharp_1.default)(imageBuffer)
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
async function optimizeToJPEG(imageBuffer, width, height, quality = 85) {
    return (0, sharp_1.default)(imageBuffer)
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
async function optimizeImage(imageBuffer, size = 'full') {
    try {
        const dimensions = exports.IMAGE_SIZES[size];
        const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
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
    }
    catch (error) {
        (0, logger_1.logError)(error, { type: 'image_optimization', size });
        throw error;
    }
}
/**
 * Generate all sizes for an image
 */
async function generateAllSizes(imageBuffer) {
    const [thumbnail, medium, full] = await Promise.all([
        optimizeImage(imageBuffer, 'thumbnail'),
        optimizeImage(imageBuffer, 'medium'),
        optimizeImage(imageBuffer, 'full'),
    ]);
    return { thumbnail, medium, full };
}
