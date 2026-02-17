import { Router, type IRouter } from 'express';
import { productController } from './product.controller.js';

export const productRoutes: IRouter = Router();

// Get all products
productRoutes.get('/', productController.getAll);

// Get product by ID
productRoutes.get('/:id', productController.getById);

// Create product
productRoutes.post('/', productController.create);

// Update product
productRoutes.put('/:id', productController.update);

// Delete product
productRoutes.delete('/:id', productController.delete);
