import type {
  BulkWriteOptions,
  DeleteOptions,
  FindOptions,
  InsertOneOptions,
  Document as MongoDocument,
} from 'mongodb';

type InsertSharedOptions = {
  returnInserted?: boolean;
  interceptBeforeInserting?(doc: MongoDocument): void;
};

/**
 * an object that is used to predefine options for MongoDbCollection class
 */
export interface CollectionConfigOptions {
  /**
   * @description native mongo collection find option that is used when using collection.find @example collection.find(document, option)
   * @default {limit: 20}
   */
  findOptions?: FindOptions<UntypedObject>;

  findOneOptions?: Omit<FindOptions<UntypedObject>, 'limit'>;

  insertOptions?: InsertSharedOptions & {
    nativeMongoInsertOptions?: BulkWriteOptions;
  };

  insertOneOptions?: InsertSharedOptions & {
    nativeMongoInsertOptions?: InsertOneOptions;
  };

  deleteOptions?: {
    nativeMongoDeleteOptions?: DeleteOptions;
  };
}
