import path from 'path';
import winston, { format, type LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { envVars } from '../config/index.js';
import MongoDbLogger from './db/MongoDb/MongoDbLogger.js';

const __dirname = (await import('./getDirname.js')).default(import.meta.url);

const levels: LoggerOptions['levels'] = {
  error: 0,
  httpError: 1,
  warn: 1,
  httpWarn: 2,
};

const logger = winston.createLogger({
  levels,
  level: 'httpWarn',
  transports: [
    new DailyRotateFile({
      handleExceptions: true,
      handleRejections: true,
      filename: 'log-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      dirname: path.resolve(__dirname, '..', '..', 'logs'),
      maxFiles: '7d',
    }),
    new MongoDbLogger({
      collectionId: 'main',
      collectionName: 'logs',
      handleExceptions: true,
      handleRejections: true,
      format: format.timestamp(),
    }),
  ],
});

if (envVars.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
      log(info, next) {
        // eslint-disable-next-line no-console
        console.log('%o', info);
        next();
      },
    })
  );
}

export default logger;
