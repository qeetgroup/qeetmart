import { Router, type IRouter } from 'express';
import { productRoutes } from '../modules/products/product.routes.js';
import { orderRoutes } from '../modules/orders/order.routes.js';
import { userRoutes } from '../modules/users/user.routes.js';
import { paymentRoutes } from '../modules/payments/payment.routes.js';
import { inventoryRoutes } from '../modules/inventory/inventory.routes.js';

/**
 * API v1 Routes
 * All routes under /api/v1/*
 */
export const v1Routes: IRouter = Router();

// Mount all v1 module routes
v1Routes.use('/products', productRoutes);
v1Routes.use('/orders', orderRoutes);
v1Routes.use('/users', userRoutes);
v1Routes.use('/payments', paymentRoutes);
v1Routes.use('/inventory', inventoryRoutes);
