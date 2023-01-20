import Bull from 'bull';
import { Listener, OrderCreatedEvent, Subjects } from '@dsktickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Calculate expiration
    const delay = new Date(data.expiration).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process job: ', delay);

    // Enqueue a job
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: delay,
      }
    );

    msg.ack();
  }
}
