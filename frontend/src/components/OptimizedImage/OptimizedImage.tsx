/**
 * Optimized Image component with lazy loading and blur placeholder
 * Supports WebP with JPEG fallback
 */

import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import styles from './OptimizedImage.module.css';

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  srcSet?: {
    webp: string;
    jpeg: string;
  };
  blurDataUrl?: string;
  alt: string;
  size?: 'thumbnail' | 'medium' | 'full';
  priority?: boolean; // Load immediately without lazy loading
}

export function OptimizedImage({
  src,
  srcSet,
  blurDataUrl,
  alt,
  size = 'medium',
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const blurPlaceholderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Skip lazy loading if priority
    if (priority) {
      setIsInView(true);
      return;
    }

    // Intersection Observer for lazy loading
    if (imgRef.current && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before image enters viewport
        }
      );

      observerRef.current.observe(imgRef.current);
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Set blur placeholder background image via ref to avoid inline styles
  useEffect(() => {
    if (blurPlaceholderRef.current && blurDataUrl) {
      blurPlaceholderRef.current.style.setProperty('--blur-image', `url(${blurDataUrl})`);
    }
  }, [blurDataUrl]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!srcSet) return undefined;

    // WebP srcSet
    const webpSrcSet = srcSet.webp;
    // JPEG fallback srcSet
    const jpegSrcSet = srcSet.jpeg;

    return {
      webp: webpSrcSet,
      jpeg: jpegSrcSet,
    };
  };

  const srcSetData = generateSrcSet();

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Blur placeholder */}
      {blurDataUrl && !isLoaded && (
        <div
          ref={blurPlaceholderRef}
          className={styles.blurPlaceholder}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && (
        <picture>
          {/* WebP source */}
          {srcSetData?.webp && (
            <source srcSet={srcSetData.webp} type="image/webp" />
          )}
          {/* JPEG fallback */}
          <img
            ref={imgRef}
            src={srcSetData?.jpeg || src}
            alt={alt}
            className={`${styles.image} ${isLoaded ? styles.loaded : ''} ${hasError ? styles.error : ''}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...props}
          />
        </picture>
      )}

      {/* Loading skeleton */}
      {!isLoaded && !blurDataUrl && (
        <div className={styles.skeleton} aria-hidden="true" />
      )}

      {/* Error state */}
      {hasError && (
        <div className={styles.errorPlaceholder} aria-label={alt}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

