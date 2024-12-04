import AbstractMongoDbInsert from './AbstractInsert.js';

import type {
  Filter,
  InsertOneResult,
  Document,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type {
  CrudOptions,
  Collection,
  ExecOptions,
  InsertOneExecReturn,
  MongoitSchemaDocument,
  ValidatedMongoitSchemaDocument,
} from '../../index.js';

export class InsertOne<
  MongoitDocument extends Document
> extends AbstractMongoDbInsert<MongoitDocument, 'insertOne'> {
  constructor(
    protected collection: Collection<MongoitDocument>,
    protected insertDocuments: OptionalUnlessRequiredId<
      MongoitSchemaDocument<MongoitDocument>
    >,
    protected options: CrudOptions<MongoitDocument>['insertOne']
  ) {
    super();
  }

  protected async interceptInsertion() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const interceptedDocument = await this.options!.interceptBeforeInserting!(
      this.insertDocuments as MongoitDocument
    );

    return interceptedDocument as OptionalUnlessRequiredId<MongoitDocument>;
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
        validatedDocument as MongoitDocument
      ) as OptionalUnlessRequiredId<MongoitDocument>;
    }

    return validatedDocument as OptionalUnlessRequiredId<MongoitDocument>;
  }

  protected getInsertedIds(insertResult: InsertOneResult<MongoitDocument>) {
    return { _id: insertResult.insertedId } as Filter<MongoitDocument>;
  }

  async exec<Options extends ExecOptions>(
    options?: Options
  ): Promise<
    InsertOneExecReturn<
      Options,
      ValidatedMongoitSchemaDocument<MongoitDocument>
    >
  > {
    const collection = await this.collection.collection;
    const insertDocument = await this.getInsertDocuments();

    const insertResult = await collection.insertOne(
      insertDocument,
      this.options?.nativeMongoOptions
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
