import AbstractMongoDbInsert from './AbstractMongoDbInsert.js';

import type {
  Filter,
  InsertManyResult,
  Document as MongoDocument,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type MongoDBCollection from '../../MongoDBCollection.js';
import type { ExecOptions, InsertManyExecReturn } from './MongoInsertTypes.js';
import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions.js';
import type {
  MongoSchemaDocument,
  ValidatedMongoSchemaDocument,
} from '../../MongoDbSchema/types/MongoDBSchema.js';

class MongoDbInsert<
  Document extends MongoDocument
> extends AbstractMongoDbInsert<Document, 'insertMany'> {
  constructor(
    protected collection: MongoDBCollection<Document>,
    protected insertDocuments: OptionalUnlessRequiredId<
      MongoSchemaDocument<Document>
    >[],
    protected options: CollectionCrudOptions<Document>['insertOptions']
  ) {
    super();
  }

  protected async interceptInsertion() {
    const interceptedDocuments = [] as any[];

    for await (const document of this.insertDocuments) {
      const interceptedDocument =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await this.options!.interceptBeforeInserting!(document as Document);

      interceptedDocuments.push(interceptedDocument);
    }

    return interceptedDocuments;
  }

  protected async validateAndInterceptInsertion() {
    const schemaValidationType = this.options?.schemaValidationType;

    const validatedDocuments = [] as any[];

    for await (const document of this.insertDocuments) {
      let validatedDocument = await this.collection.schema?.validate(
        document,
        schemaValidationType,
        {
          eventEmitter: this.eventEmitter,
        }
      );

      const interceptionFunction = this.options?.interceptBeforeInserting;

      if (typeof interceptionFunction === 'function') {
        validatedDocument = await interceptionFunction(
          validatedDocument as Document
        );
      }

      validatedDocuments.push(validatedDocument);
    }

    return validatedDocuments;
  }

  protected getInsertedIds({ insertedIds }: InsertManyResult<Document>) {
    const idsArray = Object.values(insertedIds).map((id) => ({ _id: id }));
    return { $or: idsArray } as Filter<Document>;
  }

  async exec<Options extends ExecOptions>(
    options?: Options
  ): Promise<
    InsertManyExecReturn<Options, ValidatedMongoSchemaDocument<Document>>
  > {
    const collection = await this.collection.collection;
    const insertDocument = await this.getInsertDocuments();

    const insertResult = await collection.insertMany(
      insertDocument,
      this.options?.nativeMongoInsertOptions
    );

    this.eventEmitter.emit('insert');

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
