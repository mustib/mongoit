import AbstractMongoDbFind from './AbstractMongoDbFind';

import type { Document as MongoDocument, FindCursor } from 'mongodb';
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

  protected hasPaginated = false;

  protected paginationObject: { pageNumber?: number; resultsPerPage?: number } =
    {};

  private addPaginateToCursor(cursor: FindCursor) {
    if (this.hasPaginated) {
      const page = this.paginationObject.pageNumber as number;
      const results = this.paginationObject.resultsPerPage as number;
      const skip = (page - 1) * results;
      cursor.limit(results);
      cursor.skip(skip);
    }
  }

  toPage(pageNumber = 1, resultsPerPage = 20) {
    this.hasPaginated = true;
    this.paginationObject.pageNumber = pageNumber;
    this.paginationObject.resultsPerPage = resultsPerPage;
    return this;
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
