import { FindOptions } from 'mongodb';

/**
 * an object that is used to predefine options for MongoDbCollection class
 */
export interface CollectionConfigOptions {
  /**
   * @description native mongo collection find option that is used when using collection.find @example collection.find(document, option)
   * @default {limit: 20}
   */
  findOptions?: FindOptions<UntypedObject>;
}
