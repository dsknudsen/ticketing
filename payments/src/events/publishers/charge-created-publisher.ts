import { PaymentCreatedEvent, Publisher, Subjects } from '@dsktickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
