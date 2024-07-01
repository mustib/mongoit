import AbstractMongoDbInsert from './AbstractInsert.js';

import type {
  Filter,
  InsertOneResult,
  Document as MongoDocument,
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
  Document extends MongoDocument
> extends AbstractMongoDbInsert<Document, 'insertOne'> {
  constructor(
    protected collection: Collection<Document>,
    protected insertDocuments: OptionalUnlessRequiredId<
      MongoitSchemaDocument<Document>
    >,
    protected options: CrudOptions<Document>['insertOne']
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
    InsertOneExecReturn<Options, ValidatedMongoitSchemaDocument<Document>>
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
