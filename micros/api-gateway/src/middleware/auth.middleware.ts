import { Request, Response, NextFunction } from 'express';

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
    // Store token in request for downstream services
    (req as any).token = token;
  }

  // For public endpoints, allow through
  // For protected endpoints, you can add validation here
  const publicPaths = ['/health', '/info', '/api/v1/auth/login', '/api/v1/auth/register'];
  
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // TODO: Add token validation for protected routes
  // For now, we'll forward all requests and let services handle auth
  next();
};
