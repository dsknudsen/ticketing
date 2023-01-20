import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, Subjects } from '@dsktickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../model/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Find ticket
    const ticket = await Ticket.findById(data.ticket.id);

    // Release ticket by setting orderId to null
    if (!ticket) {
      throw new Error('No ticket associated with cancelled order');
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    // Send ticket updated event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId, // This is now equal to undefined
    });

    // ack the message
    msg.ack();
  }
}
