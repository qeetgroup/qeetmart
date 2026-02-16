import { Request, Response } from 'express';
import { orderService } from './order.service.js';

export const orderController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const orders = await orderService.getAll();
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch orders', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const order = await orderService.getById(id);
      
      if (!order) {
        res.status(404).json({
          success: false,
          error: { message: 'Order not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch order', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.params['userId']);
      const orders = await orderService.getByUserId(userId);
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch user orders', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const order = await orderService.create(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') || error.message.includes('Insufficient') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message || 'Failed to create order', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const { status } = req.body;
      const order = await orderService.updateStatus(id, status);
      
      if (!order) {
        res.status(404).json({
          success: false,
          error: { message: 'Order not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update order status', code: 'INTERNAL_ERROR' },
      });
    }
  },
};
