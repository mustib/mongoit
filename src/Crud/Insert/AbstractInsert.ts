import { TypedEventEmitter } from '@mustib/utils';

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
  Collection,
  CrudOptions,
  MongoitSchemaDocument,
  ValidatedMongoitSchemaDocument,
} from '../../types/index.js';

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
  protected eventEmitter = new TypedEventEmitter<{ insert: any }>();

  protected abstract collection: Collection<Document>;

  protected abstract insertDocuments: InsertDocumentsType<
    Type,
    MongoitSchemaDocument<Document>
  >;

  protected abstract options: Type extends 'insertMany'
    ? CrudOptions<Document>['insert']
    : Type extends 'insertOne'
    ? CrudOptions<Document>['insertOne']
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

    if (!hasInterception && !hasSchema) return this.insertDocuments as never;

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
    ? InsertManyExecReturn<Options, ValidatedMongoitSchemaDocument<Document>>
    : Type extends 'insertOne'
    ? InsertOneExecReturn<Options, ValidatedMongoitSchemaDocument<Document>>
    : never
  >;
}

export default AbstractMongoDbInsert;
