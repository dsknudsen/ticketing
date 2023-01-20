import request from 'supertest';
import { app } from '../app';

// Making this a global function for ease of use.  Could put in a different file and export/import as well.
export const signup = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie;
};
