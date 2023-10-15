import type {
  Filter,
  InsertManyResult,
  InsertOneResult,
  Document as MongoDocument,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type {
  ExecOptions,
  InsertManyExecReturn,
  InsertOneExecReturn,
} from './MongoInsertTypes.js';

import type MongoDBCollection from '../../MongoDBCollection.js';
import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions.js';

type InsertType = 'insertOne' | 'insertMany';

type InsertDocumentsType<
  Type extends InsertType,
  Document extends MongoDocument
> = Type extends 'insertMany'
  ? OptionalUnlessRequiredId<Document>[]
  : Type extends 'insertOne'
  ? OptionalUnlessRequiredId<Document>
  : never;

abstract class AbstractMongoDbInsert<
  Document extends MongoDocument,
  Type extends InsertType
> {
  protected abstract collection: MongoDBCollection<Document>;

  protected abstract insertDocuments: InsertDocumentsType<Type, Document>;

  protected abstract options: Type extends 'insertMany'
    ? CollectionCrudOptions<Document>['insertOptions']
    : Type extends 'insertOne'
    ? CollectionCrudOptions<Document>['insertOneOptions']
    : never;

  protected abstract interceptInsertion(): Promise<
    InsertDocumentsType<Type, Document>
  >;

  protected abstract validateAndInterceptInsertion(): Promise<
    InsertDocumentsType<Type, Document>
  >;

  protected async getInsertDocuments(): Promise<
    InsertDocumentsType<Type, Document>
  > {
    const hasInterception =
      typeof this.options?.interceptBeforeInserting === 'function';

    const hasSchema = this.collection.schema !== null;

    if (!hasInterception && !hasSchema) return this.insertDocuments;

    if (hasInterception && !hasSchema) {
      return this.interceptInsertion();
    }

    return this.validateAndInterceptInsertion();
  }

  protected abstract getInsertedIds(
    insertResult: Type extends 'insertMany'
      ? InsertManyResult<Document>
      : Type extends 'insertOne'
      ? InsertOneResult<Document>
      : never
  ): Filter<Document>;

  abstract exec<Options extends ExecOptions>(
    options?: Options
  ): Promise<
    Type extends 'insertMany'
      ? InsertManyExecReturn<Options, Document>
      : Type extends 'insertOne'
      ? InsertOneExecReturn<Options, Document>
      : never
  >;
}

export default AbstractMongoDbInsert;
