import AbstractMongoDbFind from './AbstractMongoDbFind';

import type {
  Document as _MongoDocument,
  Collection,
  Filter,
  FindCursor,
} from 'mongodb';

import type { CollectionConfigOptions } from '../types/CollectionConfigOptions';

class MongoDbFind<
  Document extends _MongoDocument
> extends AbstractMongoDbFind<Document> {
  constructor(
    protected collection: Promise<Collection<Document>>,
    protected filterDocument?: Filter<Document & { _id?: string }>,
    protected options?: CollectionConfigOptions['findOptions']
  ) {
    super();
  }

  protected hasPaginated = false;

  protected paginationObject: { pageNumber?: number; resultsPerPage?: number } =
    {};

  private addPaginateToCursor(cursor: FindCursor) {
    if (this.hasPaginated) {
      const page = this.paginationObject.pageNumber as number;
      const results = this.paginationObject.resultsPerPage as number;
      const skip = (page - 1) * results;
      cursor.skip(skip);
    }
  }

  // TODO: Implement cursor paradigms. REFERENCE https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/cursor/
  async exec() {
    const cursor = await this.createCursor();
    this.addPaginateToCursor(cursor);
    const documents = await cursor.toArray();
    cursor.close();

    return documents;
  }
}

export default MongoDbFind;
