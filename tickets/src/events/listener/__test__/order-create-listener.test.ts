import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent } from '@dsktickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Ticket } from '../../../model/ticket';

const setup = async () => {
  // Create instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiration: 'expire',
    ticket: { id: ticket.id, price: ticket.price },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('updates ticket status on new order event', async () => {
  const { listener, data, msg, ticket } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Get ticket
  const updatedTicket = await Ticket.findById(ticket.id);

  // Write assertions to make sure ticket was created
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  // call the onMessage function with the data object + message object
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event]', async () => {
  // call the onMessage function with the data object + message object
  const { listener, data, msg } = await setup();
  console.log(data);
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
