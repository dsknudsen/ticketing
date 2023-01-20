import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent } from '@dsktickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-event';
import { Ticket } from '../../../model/ticket';

const setup = async () => {
  // Create instance of listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: { id: ticket.id },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('updates ticket status on cancelled order event', async () => {
  const { listener, data, msg, ticket } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Get ticket
  const cancelledTicket = await Ticket.findById(ticket.id);

  // Write assertions to make sure ticket was created
  expect(cancelledTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
  // call the onMessage function with the data object + message object
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  expect(msg.ack).toHaveBeenCalled();
});

// it('publishes a ticket updated event]', async () => {
//   // call the onMessage function with the data object + message object
//   const { listener, data, msg } = await setup();
//   console.log(data);
//   // call the onMessage function with the data object + message object
//   await listener.onMessage(data, msg);

//   // Write assertions to make sure ticket was created
//   expect(natsWrapper.client.publish).toHaveBeenCalled();

//   const ticketUpdatedData = JSON.parse(
//     (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
//   );
//   expect(data.id).toEqual(ticketUpdatedData.orderId);
// });
