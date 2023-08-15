import AbstractMongoDbFindAndDelete from './AbstractMongoDbFindAndDelete';

import type { Filter, Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from './MongoDBCollection';
import type { CollectionConfigOptions } from './types/CollectionConfigOptions';

class MongoDbDelete<
  Document extends MongoDocument
> extends AbstractMongoDbFindAndDelete<Document> {
  protected query: Document[] = [];

  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument: Filter<Document & { _id?: string }>,
    protected options: CollectionConfigOptions['deleteOptions'] & {
      deleteType: 'deleteOne' | 'deleteMany';
    }
  ) {
    super();
  }

  async exec() {
    const collection = await this.collection.collection;
    const query = this.createFilterQuery();
    const deleteResult = await collection[this.options.deleteType](
      query,
      this.options?.nativeMongoDeleteOptions
    );

    return deleteResult;
  }
}

export default MongoDbDelete;
