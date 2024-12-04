import AbstractMongoDbInsert from './AbstractInsert.js';

import type {
  Filter,
  InsertManyResult,
  Document,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type {
  CrudOptions,
  Collection,
  ExecOptions,
  InsertManyExecReturn,
  MongoitSchemaDocument,
  ValidatedMongoitSchemaDocument,
} from '../../index.js';

export class Insert<
  MongoitDocument extends Document
> extends AbstractMongoDbInsert<MongoitDocument, 'insertMany'> {
  constructor(
    protected collection: Collection<MongoitDocument>,
    protected insertDocuments: OptionalUnlessRequiredId<
      MongoitSchemaDocument<MongoitDocument>
    >[],
    protected options: CrudOptions<MongoitDocument>['insert']
  ) {
    super();
  }

  protected async interceptInsertion() {
    const interceptedDocuments = [] as any[];

    for await (const document of this.insertDocuments) {
      const interceptedDocument =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await this.options!.interceptBeforeInserting!(
          document as MongoitDocument
        );

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
          validatedDocument as MongoitDocument
        );
      }

      validatedDocuments.push(validatedDocument);
    }

    return validatedDocuments;
  }

  protected getInsertedIds({ insertedIds }: InsertManyResult<MongoitDocument>) {
    const idsArray = Object.values(insertedIds).map((id) => ({ _id: id }));
    return { $or: idsArray } as Filter<MongoitDocument>;
  }

  async exec<Options extends ExecOptions>(
    options?: Options
  ): Promise<
    InsertManyExecReturn<
      Options,
      ValidatedMongoitSchemaDocument<MongoitDocument>
    >
  > {
    const collection = await this.collection.collection;
    const insertDocument = await this.getInsertDocuments();

    const insertResult = await collection.insertMany(
      insertDocument,
      this.options?.nativeMongoOptions
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
