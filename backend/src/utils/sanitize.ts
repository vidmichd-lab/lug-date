/**
 * Sanitize user input to prevent XSS attacks
 * Uses DOMPurify for robust HTML sanitization
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a JSDOM window for DOMPurify to work in Node.js environment
// DOMPurify requires a DOM, so we create a minimal one
const createDOMPurify = () => {
  const window = new JSDOM('').window;
  return DOMPurify(window as any);
};

// Initialize DOMPurify instance
const purify = createDOMPurify();

/**
 * Sanitize text input - removes HTML and dangerous content
 * Uses DOMPurify for robust XSS protection
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  // Use DOMPurify to sanitize HTML content
  // Config: strip all HTML tags, keep only text content
  const sanitized = purify.sanitize(text, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });

  // Remove control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  const cleaned = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  return cleaned.trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key]) as any;
    } else if (
      typeof sanitized[key] === 'object' &&
      sanitized[key] !== null &&
      !Array.isArray(sanitized[key])
    ) {
      sanitized[key] = sanitizeObject(sanitized[key]) as any;
    } else if (Array.isArray(sanitized[key])) {
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
