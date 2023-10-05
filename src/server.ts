import './config/mongoDbConnect.js';
import https from 'node:https';
import { envVars } from './config/index.js';
import app from './app.js';
import type { IncomingMessage, ServerResponse } from 'http';

const serverOptions: https.ServerOptions<
  typeof IncomingMessage,
  typeof ServerResponse
> = {
  key: envVars.SSL_KEY,
  cert: envVars.SSL_CERT,
};

async function startServer() {
  https
    .createServer(serverOptions, app)
    .listen(envVars.PORT)
    .once('listening', () => {
      // eslint-disable-next-line no-console
      console.log(`Server is Listening on Port ${envVars.PORT}`);
    });
}

startServer();
