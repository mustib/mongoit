import type MongoSanitize from '../utils/db/MongoDb/MongoDbSanitize';

declare global {
  declare interface UntypedObject {
    [key: string]: any;
  }

  declare namespace NodeJS {
    /*
      Environment Variables Types Support (process.env)
    */
    declare interface ProcessEnv {
      [key: string]: string | undefined;
      PORT: string | undefined;
      NODE_ENV: 'production' | 'development' | undefined;
    }
  }
}

/*
  Extending Express
*/
declare module 'express-serve-static-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Request<P = any, ResBody = any, ReqBody = any, ReqQuery = any> {
    sanitizeMongo: {
      body: MongoSanitize<ReqBody>;
      query: MongoSanitize<ReqQuery>;
      params: MongoSanitize<P>;
    };
  }
}

export {};
