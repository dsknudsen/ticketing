import { Publisher, OrderCancelledEvent, Subjects } from '@dsktickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
