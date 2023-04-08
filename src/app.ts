import express, { Express } from 'express';
import apiRouter from './api';

const app: Express = express();

app.use(express.json());
app.use('/api', apiRouter);

export default app;
