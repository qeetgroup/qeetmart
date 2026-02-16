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
      const user = await userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create user', code: 'INTERNAL_ERROR' },
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
