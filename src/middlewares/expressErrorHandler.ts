import { ErrorRequestHandler } from 'express';
import { AbstractAppError, ApiFailResponse, logger } from '../utils';

// NOTE: if _next param removed express will not consider this as an error handler function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const expressErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const errorData = {
    message: err.message,
    name: err.name,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    query: req.query,
  };

  if (err instanceof AbstractAppError) {
    new ApiFailResponse(res).setMessage(err.message).send();
    logger.log('httpWarn', errorData);
    return;
  }

  res.send(err.message);
  logger.log('httpError', errorData);
};

export default expressErrorHandler;
