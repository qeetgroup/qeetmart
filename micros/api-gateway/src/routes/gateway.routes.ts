import { Router, type IRouter } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { services, routeConfig } from '../config/services.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

/**
 * Gateway Routes
 * Sets up proxy middleware for each service route
 */
export const gatewayRoutes: IRouter = Router();

// Apply auth middleware to all routes
gatewayRoutes.use(authMiddleware);

// Create proxy middleware for each route
routeConfig.forEach(({ path, service, stripPrefix = false }) => {
  const serviceConfig = services[service];
  
  if (!serviceConfig) {
    console.warn(`Service configuration not found for: ${service}`);
    return;
  }

  const proxyOptions: Options = {
    target: serviceConfig.baseUrl,
    changeOrigin: true,
    pathRewrite: stripPrefix
      ? {
          [`^${path}`]: '', // Remove the path prefix
        }
      : undefined,
    timeout: serviceConfig.timeout || 5000,
    on: {
      error: (err, req, res) => {
        console.error(`Proxy error for ${path}:`, err.message);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            error: {
              message: `Service ${serviceConfig.name} is unavailable`,
              code: 'SERVICE_UNAVAILABLE',
            },
          });
        }
      },
      proxyReq: (proxyReq, req) => {
        // Forward correlation ID
        if (req.headers['x-correlation-id']) {
          proxyReq.setHeader('x-correlation-id', req.headers['x-correlation-id'] as string);
        }
        
        // Forward original IP
        const forwardedFor = req.headers['x-forwarded-for'] || req.ip;
        proxyReq.setHeader('x-forwarded-for', forwardedFor as string);
        
        // Forward authorization token if present
        if ((req as any).token) {
          proxyReq.setHeader('authorization', `Bearer ${(req as any).token}`);
        }
      },
    },
  };

  console.log(`Setting up proxy: ${path} -> ${serviceConfig.baseUrl}`);
  gatewayRoutes.use(path, createProxyMiddleware(proxyOptions));
});
