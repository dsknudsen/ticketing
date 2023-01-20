import { Publisher, OrderCreatedEvent, Subjects } from '@dsktickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
