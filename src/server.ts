import { envVars, connectDB } from './config';
import app from './app';

async function startServer() {
  await connectDB();
  app.listen(envVars.PORT).once('listening', () => {
    // eslint-disable-next-line no-console
    console.log(`Server is Listening on Port ${envVars.PORT}`);
  });
}

startServer();
