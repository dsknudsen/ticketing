import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // Create instance of a ticket
  const ticket = Ticket.build({ title: 'concert', price: 5, userId: '123' });

  // Save a ticket to the database
  await ticket.save();

  // Fetch ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the ticket we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // Save first fetched ticket
  await firstInstance!.save();

  // Save second fetched ticket which should fail
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  // Create instance of a ticket
  const ticket = Ticket.build({ title: 'concert', price: 5, userId: '123' });

  // Save a ticket to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
