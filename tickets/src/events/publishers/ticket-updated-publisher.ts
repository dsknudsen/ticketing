import { Publisher, Subjects, TicketUpdatedEvent } from '@dsktickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
