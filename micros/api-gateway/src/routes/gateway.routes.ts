import { Router, type IRouter, type Request, type Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { services, routeConfig } from '../config/services.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { gatewayConfig } from '../config/env.js';

/**
 * Gateway Routes
 * Sets up proxy middleware for each service route
 */
export const gatewayRoutes: IRouter = Router();

// Apply auth middleware to all routes
gatewayRoutes.use(authMiddleware);

const isExpressResponse = (value: unknown): value is Response => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'status' in value && typeof (value as Response).status === 'function';
};

// Create proxy middleware for each route
routeConfig.forEach(({ path, service, stripPrefix = false }) => {
  const serviceConfig = services[service];
  
  if (!serviceConfig) {
    console.warn(`Service configuration not found for: ${service}`);
    return;
  }

  const proxyOptions: Options<Request, Response> = {
    target: serviceConfig.baseUrl,
    changeOrigin: true,
    xfwd: true,
    ...(stripPrefix
      ? {
          pathRewrite: {
            [`^${path}`]: '', // Remove the path prefix
          },
        }
      : {}),
    timeout: serviceConfig.timeout || gatewayConfig.proxyTimeoutMs,
    proxyTimeout: serviceConfig.timeout || gatewayConfig.proxyTimeoutMs,
    on: {
      error: (err, req, res) => {
        console.error(`Proxy error for ${path}:`, err.message);

        if (isExpressResponse(res) && !res.headersSent) {
          const correlationId =
            req.correlationId ??
            (typeof req.headers['x-correlation-id'] === 'string'
              ? req.headers['x-correlation-id']
              : undefined);

          const payload = JSON.stringify({
            success: false,
            error: {
              message: `Service ${serviceConfig.name} is unavailable`,
              code: 'SERVICE_UNAVAILABLE',
              correlationId,
            },
          });

          res.status(502).type('application/json').send(payload);
        }
      },
      proxyReq: (proxyReq, req) => {
        // Forward correlation ID
        const correlationId =
          req.correlationId ??
          (typeof req.headers['x-correlation-id'] === 'string'
            ? req.headers['x-correlation-id']
            : undefined);

        if (correlationId) {
          proxyReq.setHeader('x-correlation-id', correlationId);
          proxyReq.setHeader('x-request-id', correlationId);
        }

        // Forward authorization token if present
        if (req.token) {
          proxyReq.setHeader('authorization', `Bearer ${req.token}`);
        }
      },
    },
  };

  console.log(`Setting up proxy: ${path} -> ${serviceConfig.baseUrl}`);
  gatewayRoutes.use(path, createProxyMiddleware<Request, Response>(proxyOptions));
});
