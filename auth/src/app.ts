import express from 'express';
import { json } from 'body-parser';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@dsktickets/common';

const app = express();

// Make React aware that we are using ingress proxy
app.set('trust proxy', true);

// Maps HTTP elements to JSON for consumption
app.use(json());

// Set cookie session properties; flag secure to only be on if not testing as supertest doesn't support HTTPS
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.get('*', async (req, res, next) => {
  // Note this isn't calling next(err) for async as it uses express-async-errors
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
