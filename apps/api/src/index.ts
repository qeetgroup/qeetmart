import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './common/error-handler.js';
import { v1Routes } from './routes/v1.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100, 
});
app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API versioned routes
// v1 routes: /api/v1/*
app.use('/api/v1', v1Routes);

// Future: v2 routes can be added here
// app.use('/api/v2', v2Routes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const port = Number(process.env['PORT']) || 3001;
const host = process.env['HOST'] || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
});
