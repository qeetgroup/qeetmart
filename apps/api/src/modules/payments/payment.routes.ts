import { Router, type IRouter } from 'express';
import { paymentController } from './payment.controller.js';

export const paymentRoutes: IRouter = Router();

// Get all payments
paymentRoutes.get('/', paymentController.getAll);

// Get payment by ID
paymentRoutes.get('/:id', paymentController.getById);

// Get payments by order ID
paymentRoutes.get('/order/:orderId', paymentController.getByOrderId);

// Create payment
paymentRoutes.post('/', paymentController.create);

// Update payment status
paymentRoutes.patch('/:id/status', paymentController.updateStatus);
