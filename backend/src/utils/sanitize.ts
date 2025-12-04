/**
 * Sanitize user input to prevent XSS attacks
 * Uses DOMPurify for robust HTML sanitization
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a JSDOM window for DOMPurify to work in Node.js environment
// DOMPurify requires a DOM, so we create a minimal one
// Lazy initialization to avoid errors if JSDOM fails
let purifyInstance: ReturnType<typeof DOMPurify> | null = null;

const getDOMPurify = () => {
  if (!purifyInstance) {
    try {
      const window = new JSDOM('').window;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      purifyInstance = DOMPurify(window as any);
    } catch (error) {
      // Fallback: if DOMPurify fails, we'll use basic sanitization
      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to initialize DOMPurify:', error);
      }
      return null;
    }
  }
  return purifyInstance;
};

/**
 * Sanitize text input - removes HTML and dangerous content
 * Uses DOMPurify for robust XSS protection
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  const purify = getDOMPurify();

  // Use DOMPurify to sanitize HTML content if available
  // Fallback to basic sanitization if DOMPurify is not available
  let sanitized: string;
  if (purify) {
    // Config: strip all HTML tags, keep only text content
    sanitized = purify.sanitize(text, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      KEEP_CONTENT: true, // Keep text content
    });
  } else {
    // Fallback: basic HTML tag removal
    sanitized = text.replace(/<[^>]*>/g, '');
  }

  // Remove control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  const cleaned = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  return cleaned.trim();
}

/**
 * Sanitize object recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sanitized[key] = sanitizeText(sanitized[key]) as any;
    } else if (
      typeof sanitized[key] === 'object' &&
      sanitized[key] !== null &&
      !Array.isArray(sanitized[key])
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sanitized[key] = sanitizeObject(sanitized[key]) as any;
    } else if (Array.isArray(sanitized[key])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sanitized[key] = sanitized[key].map((item: any) =>
        typeof item === 'string'
          ? sanitizeText(item)
          : typeof item === 'object'
            ? sanitizeObject(item)
            : item
      ) as any;
    }
  }

  return sanitized;
}

/**
 * Sanitize middleware for Express
 * Sanitizes request body
 */
import { Request, Response, NextFunction } from 'express';

export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}
