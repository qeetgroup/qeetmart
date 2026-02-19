import { Request, Response, NextFunction } from 'express';

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
  const correlationId = req.headers['x-correlation-id'] || 
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add correlation ID to request headers
  req.headers['x-correlation-id'] = correlationId;
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    correlationId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode}`, {
      correlationId,
      duration: `${duration}ms`,
    });
  });

  next();
};
