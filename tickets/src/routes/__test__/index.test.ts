import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: String, price: Number) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
};

it('can fetch a list of tickets', async () => {
  await createTicket('concert 1', 100);
  await createTicket('concert 2', 200);
  await createTicket('concert 3', 300);

  const ticketResponse = await request(app)
    .get('/api/tickets/')
    .send()
    .expect(200);

  expect(ticketResponse.body.length).toEqual(3);
});
