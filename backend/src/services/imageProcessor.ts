/**
 * Image Processing Service
 * Handles async image processing to avoid blocking the main thread
 * Uses queue-based processing for scalability
 */

import { logger } from '../logger';
import { generateAllSizes, optimizeImage, type OptimizedImage } from '../utils/imageOptimizer';
import type { ImageSizes } from '../utils/imageOptimizer';

export interface ImageProcessingJob {
  id: string;
  imageBuffer: Buffer;
  userId?: string;
  metadata?: {
    originalName?: string;
    originalSize?: number;
    mimetype?: string;
  };
  options?: {
    sizes?: Array<keyof ImageSizes>;
    priority?: 'low' | 'normal' | 'high';
  };
  callback?: (result: ImageProcessingResult) => void;
  errorCallback?: (error: Error) => void;
}

export interface ImageProcessingResult {
  jobId: string;
  optimized?: {
    thumbnail?: OptimizedImage;
    medium?: OptimizedImage;
    full?: OptimizedImage;
  };
  allSizes?: {
    thumbnail: OptimizedImage;
    medium: OptimizedImage;
    full: OptimizedImage;
  };
  processingTime: number;
}

class ImageProcessorService {
  private queue: ImageProcessingJob[] = [];
  private processing: boolean = false;
  private maxConcurrentJobs: number = 2; // Process 2 images concurrently
  private activeJobs: number = 0;

  /**
   * Add image processing job to queue
   */
  async processImage(job: Omit<ImageProcessingJob, 'id'>): Promise<ImageProcessingResult> {
    const jobId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullJob: ImageProcessingJob = {
      ...job,
      id: jobId,
    };

    return new Promise((resolve, reject) => {
      fullJob.callback = (result) => resolve(result);
      fullJob.errorCallback = (error) => reject(error);

      // Add to queue based on priority
      if (fullJob.options?.priority === 'high') {
        this.queue.unshift(fullJob); // Add to front
      } else {
        this.queue.push(fullJob); // Add to back
      }

      logger.debug({
        type: 'image_processing_job_queued',
        jobId,
        queueLength: this.queue.length,
        priority: fullJob.options?.priority || 'normal',
      });

      // Start processing if not already running
      this.processQueue();
    });
  }

  /**
   * Process queue of image jobs
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.activeJobs >= this.maxConcurrentJobs) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.processing = true;

    // Process jobs up to maxConcurrentJobs
    const jobsToProcess = this.queue.splice(0, this.maxConcurrentJobs - this.activeJobs);

    for (const job of jobsToProcess) {
      this.activeJobs++;
      this.processJob(job).catch((error) => {
        logger.error({
          error,
          type: 'image_processing_job_failed',
          jobId: job.id,
        });
        if (job.errorCallback) {
          job.errorCallback(error);
        }
      });
    }

    this.processing = false;
  }

  /**
   * Process single image job
   */
  private async processJob(job: ImageProcessingJob): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info({
        type: 'image_processing_start',
        jobId: job.id,
        userId: job.userId,
        originalSize: job.metadata?.originalSize,
        sizes: job.options?.sizes || ['thumbnail', 'medium', 'full'],
      });

      let result: ImageProcessingResult;

      if (job.options?.sizes && job.options.sizes.length > 0) {
        // Process specific sizes
        const optimized: ImageProcessingResult['optimized'] = {};

        for (const size of job.options.sizes) {
          try {
            optimized[size] = await optimizeImage(job.imageBuffer, size);
          } catch (error) {
            logger.warn({
              error,
              type: 'image_processing_size_failed',
              jobId: job.id,
              size,
            });
          }
        }

        result = {
          jobId: job.id,
          optimized,
          processingTime: Date.now() - startTime,
        };
      } else {
        // Process all sizes
        const allSizes = await generateAllSizes(job.imageBuffer);
        result = {
          jobId: job.id,
          optimized: {}, // Empty optimized when processing all sizes
          allSizes,
          processingTime: Date.now() - startTime,
        };
      }

      logger.info({
        type: 'image_processing_complete',
        jobId: job.id,
        processingTime: result.processingTime,
        sizesProcessed: job.options?.sizes?.length || 3,
      });

      if (job.callback) {
        job.callback(result);
      }

      // Continue processing queue
      this.activeJobs--;
      this.processQueue();
    } catch (error) {
      this.activeJobs--;
      logger.error({
        error,
        type: 'image_processing_error',
        jobId: job.id,
        processingTime: Date.now() - startTime,
      });

      if (job.errorCallback) {
        job.errorCallback(error as Error);
      }

      // Continue processing queue even on error
      this.processQueue();
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number;
    activeJobs: number;
    maxConcurrentJobs: number;
  } {
    return {
      queueLength: this.queue.length,
      activeJobs: this.activeJobs,
      maxConcurrentJobs: this.maxConcurrentJobs,
    };
  }

  /**
   * Set max concurrent jobs
   */
  setMaxConcurrentJobs(max: number): void {
    this.maxConcurrentJobs = Math.max(1, Math.min(max, 5)); // Limit between 1 and 5
    logger.info({
      type: 'image_processor_config_updated',
      maxConcurrentJobs: this.maxConcurrentJobs,
    });
  }
}

// Export singleton instance
export const imageProcessorService = new ImageProcessorService();

/**
 * Process image asynchronously (non-blocking)
 * Returns immediately with a promise
 */
export async function processImageAsync(
  imageBuffer: Buffer,
  options?: {
    sizes?: Array<keyof ImageSizes>;
    priority?: 'low' | 'normal' | 'high';
    userId?: string;
    metadata?: {
      originalName?: string;
      originalSize?: number;
      mimetype?: string;
    };
  }
): Promise<ImageProcessingResult> {
  return imageProcessorService.processImage({
    imageBuffer,
    userId: options?.userId,
    metadata: options?.metadata,
    options: {
      sizes: options?.sizes,
      priority: options?.priority || 'normal',
    },
  });
}
