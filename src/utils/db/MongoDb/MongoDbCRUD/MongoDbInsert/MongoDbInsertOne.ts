import AbstractMongoDbInsert from './AbstractMongoDbInsert.js';

import type {
  Filter,
  InsertOneResult,
  Document as MongoDocument,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type MongoDBCollection from '../../MongoDBCollection.js';
import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions.js';
import type { ExecOptions, InsertOneExecReturn } from './MongoInsertTypes.js';
import type {
  MongoSchemaDocument,
  ValidatedMongoSchemaDocument,
} from '../../MongoDbSchema/types/MongoDBSchema.js';

class MongoDbInsertOne<
  Document extends MongoDocument
> extends AbstractMongoDbInsert<Document, 'insertOne'> {
  constructor(
    protected collection: MongoDBCollection<Document>,
    protected insertDocuments: OptionalUnlessRequiredId<
      MongoSchemaDocument<Document>
    >,
    protected options: CollectionCrudOptions<Document>['insertOneOptions']
  ) {
    super();
  }

  protected async interceptInsertion() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const interceptedDocument = await this.options!.interceptBeforeInserting!(
      this.insertDocuments as Document
    );

    return interceptedDocument as OptionalUnlessRequiredId<Document>;
  }

  protected async validateAndInterceptInsertion() {
    const schemaValidationType = this.options?.schemaValidationType;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validatedDocument = await this.collection.schema!.validate(
      this.insertDocuments,
      schemaValidationType,
      {
        eventEmitter: this.eventEmitter,
      }
    );

    const interceptionFunction = this.options?.interceptBeforeInserting;

    if (typeof interceptionFunction === 'function') {
      return interceptionFunction(
        validatedDocument as Document
      ) as OptionalUnlessRequiredId<Document>;
    }

    return validatedDocument as OptionalUnlessRequiredId<Document>;
  }

  protected getInsertedIds(insertResult: InsertOneResult<Document>) {
    return { _id: insertResult.insertedId } as Filter<Document>;
  }

  async exec<Options extends ExecOptions>(
    options?: Options
  ): Promise<
    InsertOneExecReturn<Options, ValidatedMongoSchemaDocument<Document>>
  > {
    const collection = await this.collection.collection;
    const insertDocument = await this.getInsertDocuments();

    const insertResult = await collection.insertOne(
      insertDocument,
      this.options?.nativeMongoInsertOptions
    );

    this.eventEmitter.emit('insert');

    if (options?.returnInserted !== false) {
      const insertedDocument = this.collection
        .findOne(this.getInsertedIds(insertResult))
        .exec();
      return insertedDocument as never;
    }

    return insertResult as never;
  }
}

export default MongoDbInsertOne;
