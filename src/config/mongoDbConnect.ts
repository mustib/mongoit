import MongoDb from '../utils/db/MongoDb/MongoDb';
import envVars from './envVars';

// eslint-disable-next-line no-new
new MongoDb(envVars.MONGO_CONNECTION_URI, {
  dbID: 'main',
  nativeMongoDbName: 'Home-Furniture',
});
