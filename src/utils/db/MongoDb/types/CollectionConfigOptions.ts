import type {
  BulkWriteOptions,
  CollectionOptions,
  DeleteOptions,
  FindOptions,
  InsertOneOptions,
  Document as MongoDocument,
  UpdateOptions,
} from 'mongodb';

import type { SchemaValidationType } from '../MongoDbSchema/types/MongoDBSchema';

export type CollectionConfigOptions = {
  /**
   * @description native mongo collection options object
   */
  nativeMongoCollectionOptions?: CollectionOptions;

  /**
   * @description config options for MongoDbCollection class
   */
  MongoDbCollectionConfigOptions?: CollectionCrudOptions;
};

type InsertSharedOptions<Document extends MongoDocument = MongoDocument> = {
  /**
   * @description a function that will be called for each document before inserting it to mongo, it will be passed the document that is ready for inserting and it's returning result will be inserted into the database
   * @param doc the document that will be inserted
   * @returns the document to be inserted
   */
  interceptBeforeInserting?(doc: Document): Document | Promise<Document>;

  /**
   * @default "FULL"
   * @description one of three values "FULL" or "PARTIAL" or "OFF"
   *
   * FULL means all schema fields will be validated from provided fields
   *
   * PARTIAL means only provided fields will be validated from schema
   *
   * OFF means no validation
   */
  schemaValidationType?: SchemaValidationType;
};

/**
 * an object that is used to predefine CRUD options for MongoDbCollection class
 */
export interface CollectionCrudOptions<
  Document extends MongoDocument = MongoDocument
> {
  findOptions?: {
    /**
     * @description native mongo collection find options that is used when using collection.find @example collection.find(document, options)
     */
    nativeMongoFindOptions?: FindOptions<Document>;
  };

  findOneOptions?: {
    /**
     * @description the same options as nativeMongoFindOptions for findOptions but with a limit set to 1
     */
    nativeMongoFindOptions?: Omit<FindOptions<Document>, 'limit'>;
  };

  insertOptions?: InsertSharedOptions<Document> & {
    /**
     * @description native mongo collection insert options that is used when using collection.insertMany @example collection.insertMany([insertDocuments], options)
     */
    nativeMongoInsertOptions?: BulkWriteOptions;
  };

  insertOneOptions?: InsertSharedOptions<Document> & {
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
