/* eslint-disable @typescript-eslint/no-use-before-define, no-console */
import { hrtime } from 'process';
import pc from 'picocolors';
import type { Request, RequestHandler, Response } from 'express';

setTimeout(() => {
  const msgLength = 45;
  const msg = 'LOGGING REQUESTS';
  const paddingSize = (msgLength - msg.length) / 2;
  const start = ''.padStart(paddingSize, '>');
  const end = ''.padEnd(paddingSize, '<');
  console.log(`\n${start}${msg}${end}\n`);
});

const devHttpLogger: RequestHandler = (req, res, next) => {
  const reqStartTime = hrtime.bigint();
  const date = new Date();
  const hours = date.getHours();

  const time = `${padStart(hours % 12, 2, '0')}:${padStart(
    date.getMinutes(),
    2,
    '0'
  )}:${padStart(date.getSeconds(), 2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;

  res.once('close', () => {
    const method = getRequestMethod(req);
    const statusCode = getResponseStatusCode(res);
    const reqDiffTime = hrtime.bigint() - reqStartTime;
    const requestTime = pc.bold(
      padStart(Number(reqDiffTime / 1_000_000n), 4, ' ')
    );

    const message = `[${time}] ${method}:${statusCode} ${requestTime}ms ${pc.underline(
      req.originalUrl
    )}`;
    console.log(message);
  });

  next();
};

function getRequestMethod(req: Request) {
  const _method = req.method;
  let method = _method.padStart(6, ' ');
  switch (_method) {
    case 'GET':
      method = pc.green(method);
      break;
    case 'POST':
      method = pc.yellow(method);
      break;
    case 'PUT':
      method = pc.blue(method);
      break;
    case 'PATCH':
      method = pc.cyan(method);
      break;
    case 'DELETE':
      method = pc.red(method);
      break;
    default:
      break;
  }
  method = pc.bold(method);

  return method;
}

function getResponseStatusCode(res: Response) {
  let statusCode = res.statusCode as any;
  if (statusCode >= 500) statusCode = pc.bgRed(statusCode);
  else if (statusCode >= 400) statusCode = pc.bgYellow(statusCode);
  else statusCode = pc.bgGreen(statusCode);
  statusCode = pc.black(statusCode);

  return statusCode;
}

function padStart(
  value: { toString: () => string },
  length: number,
  fill = ' '
) {
  return value.toString().padStart(length, fill);
}

export default devHttpLogger;
