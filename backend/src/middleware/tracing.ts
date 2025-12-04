/**
 * Distributed Tracing Middleware
 * Generates trace IDs for request tracking across services
 * Compatible with OpenTelemetry format
 */

import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { logger } from '../logger';

// Trace context interface
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
}

// Store trace context in request
declare global {
  namespace Express {
    interface Request {
      traceContext?: TraceContext;
    }
  }
}

/**
 * Generate trace ID (32 hex characters, compatible with OpenTelemetry)
 */
function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Generate span ID (16 hex characters, compatible with OpenTelemetry)
 */
function generateSpanId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Extract trace context from headers (W3C Trace Context format)
 */
function extractTraceContext(req: Request): TraceContext | null {
  const traceparent = req.headers['traceparent'] as string;
  // const tracestate = req.headers['tracestate'] as string; // Reserved for future use

  if (traceparent) {
    // Parse W3C Trace Context format: version-trace-id-parent-id-trace-flags
    // Example: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
    const parts = traceparent.split('-');
    if (parts.length === 4) {
      const [, traceId, parentSpanId, flags] = parts;
      const sampled = flags === '01';
      const spanId = generateSpanId(); // Generate new span ID for this request

      return {
        traceId,
        spanId,
        parentSpanId,
        sampled,
      };
    }
  }

  // Check for custom headers (fallback)
  const traceId = req.headers['x-trace-id'] as string;
  const parentSpanId = req.headers['x-parent-span-id'] as string;
  const sampled = req.headers['x-trace-sampled'] === 'true';

  if (traceId) {
    return {
      traceId,
      spanId: generateSpanId(),
      parentSpanId,
      sampled,
    };
  }

  return null;
}

/**
 * Inject trace context into response headers
 */
function injectTraceContext(res: Response, context: TraceContext): void {
  // W3C Trace Context format
  const traceparent = `00-${context.traceId}-${context.spanId}-${context.sampled ? '01' : '00'}`;
  res.setHeader('traceparent', traceparent);

  // Custom headers for compatibility
  res.setHeader('X-Trace-Id', context.traceId);
  res.setHeader('X-Span-Id', context.spanId);
  if (context.parentSpanId) {
    res.setHeader('X-Parent-Span-Id', context.parentSpanId);
  }
  res.setHeader('X-Trace-Sampled', context.sampled ? 'true' : 'false');
}

/**
 * Tracing middleware
 * Generates or propagates trace context for distributed tracing
 */
export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract existing trace context or create new one
  let traceContext = extractTraceContext(req);

  if (!traceContext) {
    // Create new trace context
    traceContext = {
      traceId: generateTraceId(),
      spanId: generateSpanId(),
      sampled: true, // Sample all requests for now
    };
  }

  // Store in request
  req.traceContext = traceContext;

  // Inject into response headers
  injectTraceContext(res, traceContext);

  // Create child logger with trace context
  const traceLogger = logger.child({
    traceId: traceContext.traceId,
    spanId: traceContext.spanId,
    parentSpanId: traceContext.parentSpanId,
  });

  // Store trace logger in request for use in routes
  (req as any).traceLogger = traceLogger;

  // Log trace start
  traceLogger.debug({
    type: 'trace_start',
    method: req.method,
    path: req.path,
  });

  // Track response time
  const startTime = Date.now();

  // Override res.end to log trace completion
  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - startTime;

    const traceLogger = (req as any).traceLogger || logger;
    traceLogger.debug({
      type: 'trace_end',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });

    return originalEnd(chunk, encoding, cb);
  };

  next();
}

/**
 * Get current trace context
 */
export function getTraceContext(req: Request): TraceContext | undefined {
  return req.traceContext;
}

/**
 * Create child span (for nested operations)
 */
export function createChildSpan(req: Request, operationName: string): TraceContext {
  const parentContext = req.traceContext;
  if (!parentContext) {
    throw new Error('No parent trace context found');
  }

  const childSpan: TraceContext = {
    traceId: parentContext.traceId,
    spanId: generateSpanId(),
    parentSpanId: parentContext.spanId,
    sampled: parentContext.sampled,
  };

  logger.debug({
    type: 'span_start',
    traceId: childSpan.traceId,
    spanId: childSpan.spanId,
    parentSpanId: childSpan.parentSpanId,
    operation: operationName,
  });

  return childSpan;
}

/**
 * End child span
 */
export function endChildSpan(span: TraceContext, operationName: string, duration?: number): void {
  logger.debug({
    type: 'span_end',
    traceId: span.traceId,
    spanId: span.spanId,
    parentSpanId: span.parentSpanId,
    operation: operationName,
    duration,
  });
}
