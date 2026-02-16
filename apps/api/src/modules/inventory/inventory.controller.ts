import { Request, Response } from 'express';
import { inventoryService } from './inventory.service.js';

export const inventoryController = {
  async getByProductId(req: Request, res: Response): Promise<void> {
    try {
      const productId = String(req.params['productId']);
      const inventory = await inventoryService.getByProductId(productId);
      
      if (!inventory) {
        res.status(404).json({
          success: false,
          error: { message: 'Inventory not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: inventory });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch inventory', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const productId = String(req.params['productId']);
      const inventory = await inventoryService.update(productId, req.body);
      
      if (!inventory) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: inventory });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to update inventory', code: 'BAD_REQUEST' },
      });
    }
  },

  async reserve(req: Request, res: Response): Promise<void> {
    try {
      const productId = String(req.params['productId']);
      const { quantity } = req.body;
      const inventory = await inventoryService.reserve(productId, quantity);
      
      if (!inventory) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: inventory });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to reserve inventory', code: 'BAD_REQUEST' },
      });
    }
  },

  async release(req: Request, res: Response): Promise<void> {
    try {
      const productId = String(req.params['productId']);
      const { quantity } = req.body;
      const inventory = await inventoryService.release(productId, quantity);
      
      if (!inventory) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: inventory });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to release inventory', code: 'BAD_REQUEST' },
      });
    }
  },
};
