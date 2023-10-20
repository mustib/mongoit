import express, { Express } from 'express';

import cookieParser from 'cookie-parser';

import { MongoDb } from './utils/index.js';

import { apiRouter, staticRouter } from './api/index.js';

import expressErrorHandler from './middlewares/expressErrorHandler.js';

import { envVars } from './config/index.js';

const app: Express = express();

if (envVars.NODE_ENV !== 'production') {
  app.use((await import('./middlewares/devHttpLogger.js')).default);
}

app.use(express.json());
app.use(cookieParser());
app.use(MongoDb.sanitize);
app.use('/api', apiRouter);
app.use('/static', staticRouter);
app.use(expressErrorHandler);

export default app;
