import { Router, type IRouter } from 'express';
import { inventoryController } from './inventory.controller.js';

export const inventoryRoutes: IRouter = Router();

// Get inventory for a product
inventoryRoutes.get('/product/:productId', inventoryController.getByProductId);

// Update inventory
inventoryRoutes.patch('/product/:productId', inventoryController.update);

// Reserve inventory
inventoryRoutes.post('/product/:productId/reserve', inventoryController.reserve);

// Release reserved inventory
inventoryRoutes.post('/product/:productId/release', inventoryController.release);
