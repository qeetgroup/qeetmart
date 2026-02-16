import { Request, Response } from 'express';
import { productService } from './product.service.js';

export const productController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const products = await productService.getAll();
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch products', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const product = await productService.getById(id);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch product', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create product', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const product = await productService.update(id, req.body);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update product', code: 'INTERNAL_ERROR' },
      });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const deleted = await productService.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete product', code: 'INTERNAL_ERROR' },
      });
    }
  },
};
