import AbstractMongoDbFind from './AbstractMongoDbFind';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../../MongoDBCollection';
import type { CollectionConfigOptions } from '../../types/CollectionConfigOptions';
import type { FilterDocumentWithId } from '../../types/FilterDocumentWithId';

class MongoDbFindOne<
  Document extends MongoDocument
> extends AbstractMongoDbFind<Document> {
  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument?: FilterDocumentWithId<Document>,
    protected options?: CollectionConfigOptions['findOneOptions']
  ) {
    super();
  }

  async exec() {
    const cursor = await this.createCursor();
    cursor.limit(1);
    const doc = await cursor.next();
    cursor.close();

    return doc;
  }
}

export default MongoDbFindOne;
