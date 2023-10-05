import MongoDb from '../utils/db/MongoDb/MongoDb.js';
import envVars from './envVars.js';

// eslint-disable-next-line no-new
new MongoDb(envVars.MONGO_CONNECTION_URI, {
  dbID: 'main',
  nativeMongoDbName: 'Home-Furniture',
});
