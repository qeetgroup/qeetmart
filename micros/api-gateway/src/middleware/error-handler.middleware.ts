import { Request, Response, NextFunction } from 'express';

export interface GatewayError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Error Handler Middleware
 * Handles errors from proxy and gateway operations
 */
export const errorHandler = (
  error: GatewayError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  console.error('Gateway Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId ?? req.headers['x-correlation-id'],
  });

  // If response already sent, delegate to default handler
  if (res.headersSent) {
    return _next(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: error.code || 'GATEWAY_ERROR',
      path: req.path,
    },
  });
};
