import { Router, type IRouter } from 'express';
import { orderController } from './order.controller.js';

export const orderRoutes: IRouter = Router();

// Get all orders
orderRoutes.get('/', orderController.getAll);

// Get order by ID
orderRoutes.get('/:id', orderController.getById);

// Get orders by user ID
orderRoutes.get('/user/:userId', orderController.getByUserId);

// Create order
orderRoutes.post('/', orderController.create);

// Update order status
orderRoutes.patch('/:id/status', orderController.updateStatus);
