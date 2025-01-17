import type {
  BulkWriteOptions,
  CollectionOptions as MongoCollectionOptions,
  DeleteOptions,
  FindOptions,
  InsertOneOptions,
  Document,
  UpdateOptions,
} from 'mongodb';

import type {
  SchemaValidationType,
  ValidatedMongoitSchemaDocument,
} from '../index.js';

export type CollectionOptions<Schema extends Document> = {
  /**
   * @description native mongo collection options object
   */
  nativeMongoCollectionOptions?: MongoCollectionOptions;

  /**
   * @description options for Mongoit Collection class
   */
  MongoitCollection?: { crudOptions?: CrudOptions<Schema> };
};

type InsertSharedOptions<MongoitDocument extends Document> = {
  /**
   * @description a function that will be called for each document before inserting it to mongo, it will be passed the document that is ready for inserting and it's returning result will be inserted into the database
   * @param doc the document that will be inserted
   * @returns the document to be inserted
   */
  interceptBeforeInserting?(
    doc: ValidatedMongoitSchemaDocument<MongoitDocument>
  ):
    | ValidatedMongoitSchemaDocument<MongoitDocument>
    | Promise<ValidatedMongoitSchemaDocument<MongoitDocument>>;

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

type FindSharedOptions<MongoitDocument extends Document = Document> = {
  /**
   * @description an alias function for native mongo curser.map
   *
   * @param doc find document
   * @returns find result
   */
  interceptAfterFinding?(
    doc: ValidatedMongoitSchemaDocument<MongoitDocument> & { _id: string }
  ): ValidatedMongoitSchemaDocument<MongoitDocument> | object;
};

/**
 * an object that is used to predefine CRUD options for Mongoit Collection class
 */
export interface CrudOptions<MongoitDocument extends Document> {
  find?: FindSharedOptions<MongoitDocument> & {
    /**
     * @description native mongo collection find options that is used when using collection.find @example collection.find(document, options)
     */
    nativeMongoOptions?: FindOptions<MongoitDocument>;
  };

  findOne?: FindSharedOptions<MongoitDocument> & {
    /**
     * @description the same options as nativeMongoFindOptions for findOptions but with a limit set to 1
     */
    nativeMongoOptions?: Omit<FindOptions<MongoitDocument>, 'limit'>;
  };

  insert?: InsertSharedOptions<MongoitDocument> & {
    /**
     * @description native mongo collection insert options that is used when using collection.insertMany @example collection.insertMany([insertDocuments], options)
     */
    nativeMongoOptions?: BulkWriteOptions;
  };

  insertOne?: InsertSharedOptions<MongoitDocument> & {
    /**
     * @description native mongo collection insert options that is used when using collection.insertOne @example collection.insertOne(insertDocument, options)
     */
    nativeMongoOptions?: InsertOneOptions;
  };

  delete?: {
    /**
     * @description native mongo collection delete options that is used when using both collection.deleteMany or collection.deleteOne @example collection['deleteMany' || 'deleteOne'](filterDocument, options)
     */
    nativeMongoOptions?: DeleteOptions;
  };

  update?: {
    /**
     * @description native mongo collection update options that is used when using both collection.updateMany or collection.updateOne @example collection['updateMany' || 'updateOne'](filterDocument, updateDocument, options)
     */
    nativeMongoOptions?: UpdateOptions;
  };
}
