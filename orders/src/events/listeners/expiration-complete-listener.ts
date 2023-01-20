import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../nats-wrapper';
import {
  Subjects,
  Listener,
  ExpirationCompleteEvent,
} from '@dsktickets/common';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { Order, OrderStatus } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    // Find order and associated ticket
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) {
      throw new Error('Order not found to expire');
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    // Set order status to cancelled.  Our isReserved check will ensure the ticket is deemed no reserved
    order.set({ status: OrderStatus.Cancelled });

    // Save order
    await order.save();

    // Fire order cancelled event
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
