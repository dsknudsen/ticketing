import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { natsWrapper } from '../nats-wrapper';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@dsktickets/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/charge-created-publisher';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    // Find error
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }

    // Make sure requesting user same as order user
    if (order.userId! !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // Make sure order isn't cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for cancelled order');
    }

    // Make payment charge
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    // Store payment
    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();

    // Publish payment event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    // Return success
    res.status(201).send({ id: payment.id });
  }
);

export { router as newPaymentRouter };
