import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { gatewayRoutes } from './routes/gateway.routes.js';
import { loggingMiddleware } from './middleware/logging.middleware.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { checkServiceHealth } from './utils/health-check.js';
import { services } from './config/services.js';

const app = express();

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(loggingMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Higher limit for gateway (distributes to services)
  message: 'Too many requests from this IP, please try again later.',
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
const port = Number(process.env['PORT']) || 4000;
const host = process.env['HOST'] || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`🚀 API Gateway running on http://${host}:${port}`);
  console.log(`📋 Registered services:`, Object.values(services).map(s => s.name).join(', '));
  console.log(`🔍 Health check: http://${host}:${port}/health`);
  console.log(`📊 Service health: http://${host}:${port}/health/services`);
});
