import { Request, Response } from 'express';
import { userService } from './user.service.js';

export const userController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAll();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch users', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const user = await userService.getById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch user', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate required fields
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        res.status(400).json({
          success: false,
          error: { message: 'Missing required fields: email, name, and password are required', code: 'VALIDATION_ERROR' },
        });
        return;
      }

      const user = await userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      const errorCode = (error as any)?.code || 'INTERNAL_ERROR';
      
      // Handle Prisma unique constraint violation (duplicate email)
      if ((error as any)?.code === 'P2002') {
        res.status(409).json({
          success: false,
          error: { message: 'Email already exists', code: 'DUPLICATE_EMAIL' },
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { message: errorMessage, code: errorCode },
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const user = await userService.update(id, req.body);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update user', code: 'INTERNAL_ERROR' },
      });
    }
  },
};
