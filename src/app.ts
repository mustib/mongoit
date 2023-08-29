import express, { Express } from 'express';
import { MongoDb } from './utils';
import apiRouter from './api';
import expressErrorHandler from './middlewares/expressErrorHandler';

const app: Express = express();

app.use(express.json());
app.use(MongoDb.sanitize);
app.use('/api', apiRouter);
app.use(expressErrorHandler);

export default app;
