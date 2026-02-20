import { Request, Response, NextFunction } from 'express';
import { gatewayConfig } from '../config/env.js';
import { verifyJwtHs256 } from '../utils/jwt.js';

const publicPathPrefixes = [
  '/health',
  '/info',
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh-token',
];

/**
 * Authentication Middleware
 * Validates JWT tokens and forwards them to downstream services
 * 
 * Validates HS256 JWTs before forwarding to downstream services.
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

  const isPublicPath = publicPathPrefixes.some(path => req.path.startsWith(path));
  if (isPublicPath) {
    return next();
  }

  if (!req.token && !gatewayConfig.requireAuth) {
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

  const jwtSecret = gatewayConfig.jwt.secret;
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'JWT secret is not configured on the gateway',
        code: 'GATEWAY_MISCONFIGURED',
      },
    });
  }

  try {
    verifyJwtHs256(req.token, jwtSecret, gatewayConfig.jwt.issuer, gatewayConfig.jwt.audience);
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
        details: error instanceof Error ? error.message : 'Token verification failed',
      },
    });
  }

  next();
};
