import express, { Express } from 'express';
import { MongoDb } from './utils';
import apiRouter from './api';

const app: Express = express();

app.use(express.json());
app.use(MongoDb.sanitize);
app.use('/api', apiRouter);

export default app;
