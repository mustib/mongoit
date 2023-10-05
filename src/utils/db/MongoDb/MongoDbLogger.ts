import Transport, { type TransportStreamOptions } from 'winston-transport';
import MongoDb from './MongoDb.js';

import type MongoDBCollection from './MongoDBCollection.js';
import type { CollectionConfigOptions } from './types/CollectionConfigOptions.js';

type CollectionInfo = {
  collectionId?: string;
  collectionName: string;
  collectionOptions?: CollectionConfigOptions<any>;
};

class MongoDbLogger extends Transport {
  collection: MongoDBCollection<any>;

  constructor(options: TransportStreamOptions & CollectionInfo) {
    super(options);
    const { collectionId, collectionName, collectionOptions } = options;

    const collection = MongoDb.getMongoDb(collectionId).getCollection(
      collectionName,
      collectionOptions
    );

    this.collection = collection;
  }

  log(info: any, callback: any) {
    this.collection
      .insertOne(info, { nativeMongoInsertOptions: { noResponse: true } })
      .exec({ returnInserted: false })
      .then(callback);
  }
}

export default MongoDbLogger;
