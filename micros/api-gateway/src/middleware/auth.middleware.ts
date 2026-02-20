import { Request, Response, NextFunction } from 'express';
import { gatewayConfig } from '../config/env.js';

const publicPathPrefixes = ['/health', '/info', '/api/v1/auth/login', '/api/v1/auth/register'];

/**
 * Authentication Middleware
 * Validates JWT tokens and forwards them to downstream services
 * 
 * For now, this is a pass-through middleware that extracts the token.
 * In production, you should validate the token here before forwarding.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token) {
      // Store token in request for downstream services
      req.token = token;
    }
  }

  // Public endpoints bypass auth checks.
  if (publicPathPrefixes.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Auth is optional by default to preserve pass-through behavior.
  if (!gatewayConfig.requireAuth) {
    return next();
  }

  if (!req.token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
      },
    });
  }

  next();
};
