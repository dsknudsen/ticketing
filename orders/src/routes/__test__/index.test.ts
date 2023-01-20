import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('fetches orders for a authenticated user', async () => {
  // Create three tickets
  const ticket1 = Ticket.build({
    title: 'concert ticket 1',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket1.save();

  const ticket2 = Ticket.build({
    title: 'concert ticket 2',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket2.save();

  const ticket3 = Ticket.build({
    title: 'concert ticket 3',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket3.save();

  // Create one order for User #1
  const user1 = global.signin();
  await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket1.id })
    .expect(201);

  // Create two orders for User #2
  const user2 = global.signin();
  const { body: order1 } = await request(app) // Deconstructs and renames
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket2.id })
    .expect(201);

  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  // Make request to get orders for user #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', user2)
    .expect(201);

  // Make sure we only got the orders for User #2.
  // Logic is suboptimal as it assumes order
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order1.id);
  expect(response.body[1].id).toEqual(order2.id);
});
