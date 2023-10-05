import AbstractMongoDbFind from './AbstractMongoDbFind.js';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../../MongoDBCollection.js';
import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions.js';
import type { FilterDocumentWithId } from '../../types/FilterDocumentWithId.js';

class MongoDbFindOne<
  Document extends MongoDocument
> extends AbstractMongoDbFind<Document> {
  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument?: FilterDocumentWithId<Document>,
    protected options?: CollectionCrudOptions<Document>['findOneOptions']
  ) {
    super();
  }

  protected cursorLimit = 1;

  async exec() {
    const cursor = await this.createCursor();
    const doc = await cursor.next();
    cursor.close();

    return doc;
  }
}

export default MongoDbFindOne;
