import request from 'supertest';
import { app } from '../../app';
import { signup } from '../../test/signup-helper';

const SIGNUP_URL = '/api/users/signup';
const SIGNIN_URL = '/api/users/signin';

it('failed for invalid user (email) ', async () => {
  return request(app)
    .post(SIGNIN_URL)
    .send({
      email: 'baduser@test.com',
      password: 'password',
    })
    .expect(400);
});

it('failed for a bad password', async () => {
  // Create valid user
  await signup();

  // Attempt to sign in with bad password
  await request(app)
    .post(SIGNIN_URL)
    .send({
      email: 'test@test.com',
      password: 'badpassword',
    })
    .expect(400);
});

it('sets a cookie after successful signin', async () => {
  // Create valid user
  await signup();

  const response = await request(app)
    .post(SIGNIN_URL)
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
