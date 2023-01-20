import express, { Request, Response } from 'express';
import { requireAuth, OrderStatus } from '@dsktickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  // Get all orders associated with user
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');

  // Return orders
  res.status(201).send(orders);
});

export { router as indexOrderRouter };
