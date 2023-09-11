import express, { Express } from 'express';
import { MongoDb } from './utils';
import apiRouter from './api';
import expressErrorHandler from './middlewares/expressErrorHandler';
import { envVars } from './config';

const app: Express = express();

// NOTE: using require because I don't want this code to be injected in production environment
if (envVars.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  app.use(require('./middlewares/devHttpLogger').default);
}

app.use(express.json());
app.use(MongoDb.sanitize);
app.use('/api', apiRouter);
app.use(expressErrorHandler);

export default app;
