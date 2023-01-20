import request from 'supertest';
import { app } from '../../app';
import { signup } from '../../test/signup-helper';

it('sets a cookie after successful signup', async () => {
  await signup();

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
