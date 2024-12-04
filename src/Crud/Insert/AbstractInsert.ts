import EventEmitter from 'node:events';

import type { TypedEventEmitter } from '@mustib/utils/node';

import type {
  Filter,
  InsertManyResult,
  InsertOneResult,
  Document,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type {
  ExecOptions,
  InsertManyExecReturn,
  InsertOneExecReturn,
  Collection,
  CrudOptions,
  MongoitSchemaDocument,
  ValidatedMongoitSchemaDocument,
} from '../../index.js';

type InsertType = 'insertOne' | 'insertMany';

type InsertDocumentsType<
  Type extends InsertType,
  MongoitDocument extends Document
> = Type extends 'insertMany'
  ? OptionalUnlessRequiredId<MongoitDocument>[]
  : Type extends 'insertOne'
  ? OptionalUnlessRequiredId<MongoitDocument>
  : never;

abstract class AbstractMongoDbInsert<
  MongoitDocument extends Document,
  Type extends InsertType
> {
  protected eventEmitter = new EventEmitter() as TypedEventEmitter<{
    insert: any;
  }>;

  protected abstract collection: Collection<MongoitDocument>;

  protected abstract insertDocuments: InsertDocumentsType<
    Type,
    MongoitSchemaDocument<MongoitDocument>
  >;

  protected abstract options: Type extends 'insertMany'
    ? CrudOptions<MongoitDocument>['insert']
    : Type extends 'insertOne'
    ? CrudOptions<MongoitDocument>['insertOne']
    : never;

  protected abstract interceptInsertion(): Promise<
    InsertDocumentsType<Type, MongoitDocument>
  >;

  protected abstract validateAndInterceptInsertion(): Promise<
    InsertDocumentsType<Type, MongoitDocument>
  >;

  protected async getInsertDocuments(): Promise<
    InsertDocumentsType<Type, MongoitDocument>
  > {
    const hasInterception =
      typeof this.options?.interceptBeforeInserting === 'function';

    const hasSchema = this.collection.schema !== null;

    if (!hasInterception && !hasSchema) return this.insertDocuments as never;

    if (hasInterception && !hasSchema) {
      return this.interceptInsertion();
    }

    return this.validateAndInterceptInsertion();
  }

  protected abstract getInsertedIds(
    insertResult: Type extends 'insertMany'
      ? InsertManyResult<MongoitDocument>
      : Type extends 'insertOne'
      ? InsertOneResult<MongoitDocument>
      : never
  ): Filter<MongoitDocument>;

  abstract exec<Options extends ExecOptions>(
    options?: Options
  ): Promise<
    Type extends 'insertMany'
      ? InsertManyExecReturn<
          Options,
          ValidatedMongoitSchemaDocument<MongoitDocument>
        >
      : Type extends 'insertOne'
      ? InsertOneExecReturn<
          Options,
          ValidatedMongoitSchemaDocument<MongoitDocument>
        >
      : never
  >;
}

export default AbstractMongoDbInsert;
