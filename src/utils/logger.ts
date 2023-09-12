import path from 'path';
import winston, { format, type LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import MongoDbLogger from './db/MongoDb/MongoDbLogger';

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

export default logger;
