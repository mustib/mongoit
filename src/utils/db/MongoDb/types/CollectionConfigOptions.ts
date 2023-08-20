import type {
  BulkWriteOptions,
  DeleteOptions,
  FindOptions,
  InsertOneOptions,
  Document as MongoDocument,
  UpdateOptions,
} from 'mongodb';

type InsertSharedOptions = {
  /**
   * @description a boolean indicates whether to return back the inserted documents or not
   */
  returnInserted?: boolean;

  /**
   * @description a function that will be called for each document before inserting it to mongo and it will be passed the document that is ready for inserting
   * @param doc the document that will be inserted
   */
  interceptBeforeInserting?(doc: MongoDocument): void;
};

/**
 * an object that is used to predefine options for MongoDbCollection class
 */
export interface CollectionConfigOptions {
  findOptions?: {
    /**
     * @description native mongo collection find options that is used when using collection.find @example collection.find(document, options)
     * @default {limit: 20}
     */
    nativeMongoFindOptions?: FindOptions<UntypedObject>;
  };

  findOneOptions?: {
    /**
     * @description the same options as nativeMongoFindOptions for findOptions but with a limit set to 1
     */
    nativeMongoFindOptions?: Omit<FindOptions<UntypedObject>, 'limit'>;
  };

  insertOptions?: InsertSharedOptions & {
    /**
     * @description native mongo collection insert options that is used when using collection.insertMany @example collection.insertMany([insertDocuments], options)
     */
    nativeMongoInsertOptions?: BulkWriteOptions;
  };

  insertOneOptions?: InsertSharedOptions & {
    /**
     * @description native mongo collection insert options that is used when using collection.insertOne @example collection.insertOne(insertDocument, options)
     */
    nativeMongoInsertOptions?: InsertOneOptions;
  };

  deleteOptions?: {
    /**
     * @description native mongo collection delete options that is used when using both collection.deleteMany or collection.deleteOne @example collection['deleteMany' || 'deleteOne'](filterDocument, options)
     */
    nativeMongoDeleteOptions?: DeleteOptions;
  };

  updateOptions?: {
    /**
     * @description native mongo collection update options that is used when using both collection.updateMany or collection.updateOne @example collection['updateMany' || 'updateOne'](filterDocument, updateDocument, options)
     */
    nativeMongoUpdateOptions?: UpdateOptions;
  };
}
