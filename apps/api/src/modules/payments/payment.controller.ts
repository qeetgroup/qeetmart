import { Request, Response } from 'express';
import { paymentService } from './payment.service.js';

export const paymentController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentService.getAll();
      res.json({ success: true, data: payments });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch payments', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const payment = await paymentService.getById(id);
      
      if (!payment) {
        res.status(404).json({
          success: false,
          error: { message: 'Payment not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: payment });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch payment', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async getByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const orderId = String(req.params['orderId']);
      const payments = await paymentService.getByOrderId(orderId);
      res.json({ success: true, data: payments });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch order payments', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const payment = await paymentService.create(req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to create payment', code: 'BAD_REQUEST' },
      });
    }
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const { status } = req.body;
      const payment = await paymentService.updateStatus(id, status);
      
      if (!payment) {
        res.status(404).json({
          success: false,
          error: { message: 'Payment not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: payment });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update payment status', code: 'INTERNAL_ERROR' },
      });
    }
  },
};
