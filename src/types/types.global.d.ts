/*
  Environment Variables Types Support (process.env)
*/
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    PORT: string | undefined;
    NODE_ENV: 'production' | 'development' | undefined;
  }
}

declare type UntypedObject = { [key: string]: unknown };
