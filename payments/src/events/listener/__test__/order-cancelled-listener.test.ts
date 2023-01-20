import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@dsktickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';

const setup = async () => {
  // Create instance of listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'testid',
    status: OrderStatus.Created,
    version: 0,
    price: 99,
  });

  await order.save();

  // Create cancelled order event
  console.log('Event order ID: ', order.id);
  console.log('Event version: ', order.version + 1);
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('cancels order upon OrderCancelledEvent', async () => {
  const { listener, data, msg, order } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Get order
  const updatedOrder = await Order.findById(order.id);

  // Write assertions to make sure ticket was created
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  // call the onMessage function with the data object + message object
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  expect(msg.ack).toHaveBeenCalled();
});
