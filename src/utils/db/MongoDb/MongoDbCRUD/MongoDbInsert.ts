/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  InsertManyResult,
  InsertOneResult,
  Document as MongoDocument,
  ObjectId,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type MongoDBCollection from '../MongoDBCollection';
import type { CollectionConfigOptions } from '../types/CollectionConfigOptions';

class MongoDbInsert<Document extends MongoDocument> {
  constructor(
    protected collection: MongoDBCollection<Document>,
    protected insertDocuments: OptionalUnlessRequiredId<Document>[],
    protected options: (
      | CollectionConfigOptions['insertOptions']
      | CollectionConfigOptions['insertOneOptions']
    ) & {
      insertType: 'insertMany' | 'insertOne';
    }
  ) {}

  protected getInsertDocuments(): OptionalUnlessRequiredId<Document>[] {
    const insertDocuments =
      this.options.insertType === 'insertOne'
        ? [this.insertDocuments[0]]
        : this.insertDocuments;

    const hasInterception =
      typeof this.options.interceptBeforeInserting === 'function';

    const hasSchema = this.collection.schema !== null;

    if (!hasInterception && !hasSchema) return insertDocuments;

    if (hasInterception && !hasSchema) {
      return insertDocuments.map((doc) => {
        this.options.interceptBeforeInserting!(doc);
        return doc;
      });
    }

    if (!hasInterception && hasSchema) {
      return insertDocuments.map((doc) => {
        this.collection.schema!.validate(doc);
        return doc;
      });
    }

    return insertDocuments.map((doc) => {
      const validatedDoc = this.collection.schema!.validate(doc);
      this.options.interceptBeforeInserting?.(validatedDoc);
      return validatedDoc;
    }) as any;
  }

  protected getInsertedIds(
    insertResult: InsertManyResult<Document> | InsertOneResult<Document>
  ): { _id: ObjectId }[] {
    if (this.options.insertType === 'insertOne')
      return [{ _id: (insertResult as InsertOneResult<any>).insertedId }];

    return new Array((insertResult as InsertManyResult<any>).insertedCount)
      .fill(undefined)
      .map((_, i) => ({
        _id: (insertResult as InsertManyResult<any>).insertedIds[i],
      }));
  }

  async exec() {
    const collection = await this.collection.collection;
    const insertDocuments: any = this.getInsertDocuments();

    const insertResult = await collection[this.options.insertType](
      this.options.insertType === 'insertOne'
        ? insertDocuments[0]
        : insertDocuments,
      this.options.nativeMongoInsertOptions
    );

    if (this.options.returnInserted === true) {
      return this.collection
        .find({ $or: this.getInsertedIds(insertResult) } as never)
        .exec();
    }

    return insertResult;
  }
}

export default MongoDbInsert;
