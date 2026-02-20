import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { gatewayRoutes } from './routes/gateway.routes.js';
import { loggingMiddleware } from './middleware/logging.middleware.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { checkServiceHealth } from './utils/health-check.js';
import { services } from './config/services.js';
import { gatewayConfig } from './config/env.js';

const app = express();

app.disable('x-powered-by');

// Enable only when deployed behind a trusted reverse proxy
app.set('trust proxy', gatewayConfig.trustProxy);

// Security middleware
app.use(helmet());

const corsOptions: CorsOptions = {
  credentials: gatewayConfig.cors.credentials,
  origin: gatewayConfig.cors.allowAllOrigins
    ? true
    : (origin, callback) => {
        if (!origin || gatewayConfig.cors.origins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('CORS origin not allowed'));
      },
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: gatewayConfig.jsonBodyLimit }));
app.use(express.urlencoded({ extended: gatewayConfig.urlencodedExtended }));

// Request logging
app.use(loggingMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: gatewayConfig.rateLimit.windowMs,
  max: gatewayConfig.rateLimit.max,
  message: gatewayConfig.rateLimit.message,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

// Service health check endpoint
app.get('/health/services', async (_req, res) => {
  try {
    const healthStatus = await checkServiceHealth();
    const allHealthy = healthStatus.every(s => s.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      services: healthStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Gateway info endpoint
app.get('/info', (_req, res) => {
  res.json({
    name: 'Qeetmart API Gateway',
    version: '0.0.1',
    services: Object.values(services).map(s => ({
      name: s.name,
      baseUrl: s.baseUrl,
    })),
    timestamp: new Date().toISOString(),
  });
});

// API Gateway routes (proxies to microservices)
app.use(gatewayRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const port = gatewayConfig.port;
const host = gatewayConfig.host;

const server = app.listen(port, host, () => {
  console.log(`🚀 API Gateway running on http://${host}:${port}`);
  console.log(`📋 Registered services:`, Object.values(services).map(s => s.name).join(', '));
  console.log(`🔍 Health check: http://${host}:${port}/health`);
  console.log(`📊 Service health: http://${host}:${port}/health/services`);
});

const shutdownGracePeriodMs = 10_000;
const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

shutdownSignals.forEach(signal => {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down API Gateway...`);

    server.close(error => {
      if (error) {
        console.error('Error while shutting down API Gateway', error);
        process.exit(1);
      }
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, shutdownGracePeriodMs).unref();
  });
});
