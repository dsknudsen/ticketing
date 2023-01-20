import { Subjects } from '@dsktickets/common';

// Using the mockImplementation allows us to create tests around the function being called
export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
