import AbstractMongoDbInsert from './AbstractMongoDbInsert';

import type {
  Filter,
  InsertManyResult,
  Document as MongoDocument,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type MongoDBCollection from '../../MongoDBCollection';
import type { ExecOptions, InsertManyExecReturn } from './MongoInsertTypes';
import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions';

class MongoDbInsert<
  Document extends MongoDocument
> extends AbstractMongoDbInsert<Document, 'insertMany'> {
  constructor(
    protected collection: MongoDBCollection<Document>,
    protected insertDocuments: OptionalUnlessRequiredId<Document>[],
    protected options: CollectionCrudOptions['insertOptions']
  ) {
    super();
  }

  protected interceptInsertion() {
    const interceptedDocuments = this.insertDocuments.map((document) => {
      const interceptedDocument =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.options!.interceptBeforeInserting!(document);

      return interceptedDocument as OptionalUnlessRequiredId<Document>;
    });

    return interceptedDocuments;
  }

  protected validateAndInterceptInsertion() {
    const schemaValidationType = this.options?.schemaValidationType;

    const validatedDocuments = this.insertDocuments.map((document) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const validatedDocument = this.collection.schema!.validate(
        document,
        schemaValidationType
      );

      const interceptionFunction = this.options?.interceptBeforeInserting;

      if (typeof interceptionFunction === 'function') {
        return interceptionFunction(validatedDocument);
      }

      return validatedDocument;
    });

    return validatedDocuments as OptionalUnlessRequiredId<Document>[];
  }

  protected getInsertedIds({ insertedIds }: InsertManyResult<Document>) {
    const idsArray = Object.values(insertedIds).map((id) => ({ _id: id }));
    return { $or: idsArray } as Filter<Document>;
  }

  async exec<Options extends ExecOptions>(
    options?: Options
  ): Promise<InsertManyExecReturn<Options, Document>> {
    const collection = await this.collection.collection;
    const insertDocument = this.getInsertDocuments();

    const insertResult = await collection.insertMany(
      insertDocument,
      this.options?.nativeMongoInsertOptions
    );

    if (options?.returnInserted === true) {
      const insertedDocument = await this.collection
        .find(this.getInsertedIds(insertResult))
        .exec({ returnDetails: false });

      return insertedDocument.documents as never;
    }

    return insertResult as never;
  }
}

export default MongoDbInsert;
