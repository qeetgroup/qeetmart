import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

const maxCorrelationIdLength = 128;

const normalizeCorrelationId = (value: string | string[] | undefined): string | null => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim().slice(0, maxCorrelationIdLength);
  }

  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim().slice(0, maxCorrelationIdLength);
  }

  return null;
};

/**
 * Request Logging Middleware
 * Logs all incoming requests with correlation ID
 */
export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const correlationId =
    normalizeCorrelationId(req.headers['x-correlation-id']) ?? `req-${randomUUID()}`;
  
  // Make correlation ID available throughout middleware/proxy chain
  req.correlationId = correlationId;
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
    correlationId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode}`, {
      correlationId,
      duration: `${duration}ms`,
    });
  });

  next();
};
