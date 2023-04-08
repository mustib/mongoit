import 'dotenv/config';
import app from './app';

const port =
  typeof process.env.PORT === 'string' ? parseInt(process.env.PORT, 10) : 5000;

async function startServer() {
  app.listen(port).once('listening', () => {
    // eslint-disable-next-line no-console
    console.log(`Server is Listening on Port ${port}`);
  });
}

startServer();
