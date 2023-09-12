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
} from './MongoInsertTypes';

import type MongoDBCollection from '../../MongoDBCollection';
import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions';

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
    ? CollectionCrudOptions['insertOptions']
    : Type extends 'insertOne'
    ? CollectionCrudOptions['insertOneOptions']
    : never;

  protected abstract interceptInsertion(): InsertDocumentsType<Type, Document>;

  protected abstract validateAndInterceptInsertion(): InsertDocumentsType<
    Type,
    Document
  >;

  protected getInsertDocuments(): InsertDocumentsType<Type, Document> {
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
