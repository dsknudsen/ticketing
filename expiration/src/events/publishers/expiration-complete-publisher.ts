import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@dsktickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
