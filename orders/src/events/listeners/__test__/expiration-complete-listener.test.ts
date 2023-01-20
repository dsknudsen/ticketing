import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { ExpirationCompleteEvent, OrderStatus } from '@dsktickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
  // Create instance of listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  // Create order
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'userid',
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  // Create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order, ticket };
};

it('updates the order status to cancelled', async () => {
  const { listener, data, msg, order, ticket } = await setup();

  // Emit expiration complete
  await listener.onMessage(data, msg);

  // Find order
  const updatedOrder = await Order.findById(order.id);

  // Ensure order status is cancelled
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits order cancelled event', async () => {
  // Emit expiration complete
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it('acks message', async () => {
  // call the onMessage function with the data object + message object
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  expect(msg.ack).toHaveBeenCalled();
});
