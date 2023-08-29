import { ErrorRequestHandler } from 'express';

const expressErrorHandler: ErrorRequestHandler = (err, _, res, _2) => {
  res.send(err.message);
  console.error(err);
};

export default expressErrorHandler;
