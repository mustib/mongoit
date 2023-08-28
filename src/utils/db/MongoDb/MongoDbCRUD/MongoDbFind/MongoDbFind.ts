import AbstractMongoDbFind from './AbstractMongoDbFind';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../../MongoDBCollection';
import type { CollectionConfigOptions } from '../../types/CollectionConfigOptions';
import type { FilterDocumentWithId } from '../../types/FilterDocumentWithId';

class MongoDbFind<
  Document extends MongoDocument
> extends AbstractMongoDbFind<Document> {
  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument?: FilterDocumentWithId<Document>,
    protected options?: CollectionConfigOptions['findOptions']
  ) {
    super();
  }

  protected paginationObject?: {
    resultsPerPage: number;
    skipCount: number;
  };

  toPage(pageNumber = 1, _resultsPerPage?: number) {
    if (Number.isNaN(+pageNumber)) return this;

    const resultsPerPage = Number.isNaN(+(_resultsPerPage as any))
      ? 20
      : +(_resultsPerPage as number);

    const skipCount = (pageNumber - 1) * resultsPerPage;

    this.paginationObject = {
      resultsPerPage,
      skipCount,
    };

    return this;
  }

  private async countDocuments() {
    if (this.options?.countDocuments === undefined) return;

    const collection = await this.collection.collection;
    const query = { $and: this.query };
    const count = await collection.countDocuments(query);
    this.options.countDocuments(count);
  }

  // TODO: Implement cursor paradigms. REFERENCE https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/cursor/
  async exec() {
    const cursor = await this.createCursor();

    if (this.paginationObject !== undefined) {
      const { resultsPerPage, skipCount } = this.paginationObject;
      cursor.limit(resultsPerPage);
      cursor.skip(skipCount);
    }

    await this.countDocuments();
    const documents = await cursor.toArray();
    cursor.close();

    return documents;
  }
}

export default MongoDbFind;
