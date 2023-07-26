import AbstractMongoDbFind from './AbstractMongoDbFind';

import type { Document as _MongoDocument, Collection, Filter } from 'mongodb';

import type { CollectionConfigOptions } from '../types/CollectionConfigOptions';

class MongoDbFindOne<
  Document extends _MongoDocument
> extends AbstractMongoDbFind<Document> {
  constructor(
    protected collection: Promise<Collection<Document>>,
    protected filterDocument?: Filter<Document & { _id?: string }>,
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
