import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './common/error-handler.js';
import { productRoutes } from './modules/products/product.routes.js';
import { orderRoutes } from './modules/orders/order.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { paymentRoutes } from './modules/payments/payment.routes.js';
import { inventoryRoutes } from './modules/inventory/inventory.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Configure based on your frontend URLs
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const port = Number(process.env['PORT']) || 3001;
const host = process.env['HOST'] || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
});
