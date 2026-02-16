import { Router, type IRouter } from 'express';
import { userController } from './user.controller.js';

export const userRoutes: IRouter = Router();

// Get all users
userRoutes.get('/', userController.getAll);

// Get user by ID
userRoutes.get('/:id', userController.getById);

// Create user
userRoutes.post('/', userController.create);

// Update user
userRoutes.put('/:id', userController.update);
