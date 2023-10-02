import AbstractMongoDbInsert from './AbstractMongoDbInsert';

import type {
  Filter,
  InsertOneResult,
  Document as MongoDocument,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type MongoDBCollection from '../../MongoDBCollection';
import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions';
import type { ExecOptions, InsertOneExecReturn } from './MongoInsertTypes';

class MongoDbInsertOne<
  Document extends MongoDocument
> extends AbstractMongoDbInsert<Document, 'insertOne'> {
  constructor(
    protected collection: MongoDBCollection<Document>,
    protected insertDocuments: OptionalUnlessRequiredId<Document>,
    protected options: CollectionCrudOptions<Document>['insertOneOptions']
  ) {
    super();
  }

  protected interceptInsertion() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const interceptedDocument = this.options!.interceptBeforeInserting!(
      this.insertDocuments as Document
    );

    return interceptedDocument as OptionalUnlessRequiredId<Document>;
  }

  protected validateAndInterceptInsertion() {
    const schemaValidationType = this.options?.schemaValidationType;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validatedDocument = this.collection.schema!.validate(
      this.insertDocuments,
      schemaValidationType
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
  ): Promise<InsertOneExecReturn<Options, Document>> {
    const collection = await this.collection.collection;
    const insertDocument = await this.getInsertDocuments();

    const insertResult = await collection.insertOne(
      insertDocument,
      this.options?.nativeMongoInsertOptions
    );

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
