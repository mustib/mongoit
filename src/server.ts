import './config/mongoDbConnect';
import { envVars } from './config';
import app from './app';

async function startServer() {
  app.listen(envVars.PORT).once('listening', () => {
    // eslint-disable-next-line no-console
    console.log(`Server is Listening on Port ${envVars.PORT}`);
  });
}

startServer();
