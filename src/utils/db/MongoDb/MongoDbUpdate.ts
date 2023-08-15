import AbstractMongoDbFindAndDelete from './AbstractMongoDbFindAndDelete';

import type { Filter, Document as MongoDocument, UpdateFilter } from 'mongodb';
import type MongoDBCollection from './MongoDBCollection';
import type { CollectionConfigOptions } from './types/CollectionConfigOptions';

class MongoDbUpdate<
  Document extends MongoDocument
> extends AbstractMongoDbFindAndDelete<Document> {
  protected query: Document[] = [];

  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument: Filter<Document & { _id?: string }>,
    protected updateDocument: UpdateFilter<Document>,
    protected options: CollectionConfigOptions['updateOptions'] & {
      updateType: 'updateMany' | 'updateOne';
    }
  ) {
    super();
  }

  async exec() {
    const collection = await this.collection.collection;
    const filterDocument = this.createFilterQuery();

    return collection[this.options.updateType](
      filterDocument,
      this.updateDocument,
      this.options.nativeMongoUpdateOptions
    );
  }
}

export default MongoDbUpdate;
