import Transport, { type TransportStreamOptions } from 'winston-transport';
import MongoDb from './MongoDb';

import type MongoDBCollection from './MongoDBCollection';
import type { CollectionConfigOptions } from './types/CollectionConfigOptions';

type CollectionInfo = {
  collectionId?: string;
  collectionName: string;
  collectionOptions?: CollectionConfigOptions;
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
