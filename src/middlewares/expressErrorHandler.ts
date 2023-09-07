import { ErrorRequestHandler } from 'express';
import { AbstractAppError, ApiFailResponse } from '../utils';

// NOTE: if _next param removed express will not consider this as an error handler function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const expressErrorHandler: ErrorRequestHandler = (err, _, res, _next) => {
  if (err instanceof AbstractAppError) {
    new ApiFailResponse(res).setMessage(err.message).send();
    return;
  }

  res.send(err.message);
  console.error(err);
};

export default expressErrorHandler;
