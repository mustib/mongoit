import { MongoClient, Db } from 'mongodb';

const mongoClient = new MongoClient(
  process.env.DB_MONGO_CONNECTION_URI_DEV as string,
  {
    appName: 'Home Furniture',
  }
);

// eslint-disable-next-line import/no-mutable-exports
let mongoDB: Db | undefined;

async function connectDB() {
  try {
    const client = await mongoClient.connect();
    mongoDB = client.db('Home-Furniture');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('MongoDB connection failed', err);
    process.exit(1);
  }
}

const getDB = () => {
  if (!mongoDB) {
    throw new Error('MongoDB is not initialized yet');
  }
  return mongoDB;
};

export { connectDB, getDB };
