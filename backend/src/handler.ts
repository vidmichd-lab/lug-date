/**
 * Serverless handler for Yandex Cloud Functions
 * Wraps Express app for serverless deployment using serverless-http
 */

import serverless from 'serverless-http';
import { logger } from './logger';

// Set serverless mode
process.env.SERVERLESS = 'true';

// Import app (this will initialize everything)
// Using dynamic import to avoid circular dependencies and ensure serverless mode is set
let serverlessHandler: any = null;
let appPromise: Promise<any> | null = null;

/**
 * Get or create serverless handler
 */
async function getServerlessHandler() {
  if (serverlessHandler) {
    return serverlessHandler;
  }

  // Lazy load app to ensure SERVERLESS env is set first
  if (!appPromise) {
    appPromise = import('./index');
  }
  const { default: app } = await appPromise;
  
  // Wrap Express app with serverless-http
  serverlessHandler = serverless(app, {
    binary: ['image/*', 'application/octet-stream'],
  });

  return serverlessHandler;
}

/**
 * Serverless handler function
 * This is the entry point for Yandex Cloud Functions
 */
export async function handler(event: any, context: any): Promise<any> {
  try {
    const handlerInstance = await getServerlessHandler();
    
    // Yandex Cloud Functions uses AWS Lambda-compatible format
    // serverless-http will handle the conversion
    const result = await handlerInstance(event, context);
    
    return result;
  } catch (error) {
    logger.error({ error, type: 'handler_error' });
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      }),
      isBase64Encoded: false,
    };
  }
}

