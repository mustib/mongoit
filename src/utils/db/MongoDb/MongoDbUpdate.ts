import AbstractMongoDbFindAndDelete from './AbstractMongoDbFindAndDelete';

import type { Filter, Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from './MongoDBCollection';
import type { CollectionConfigOptions } from './types/CollectionConfigOptions';
import type { UpdateFilterDocument } from './types/UpdateFilterDocument';

class MongoDbUpdate<
  Document extends MongoDocument
> extends AbstractMongoDbFindAndDelete<Document> {
  protected query: Document[] = [];

  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument: Filter<Document & { _id?: string }>,
    protected updateDocument: UpdateFilterDocument<Document>,
    protected options: CollectionConfigOptions['updateOptions'] & {
      updateType: 'updateMany' | 'updateOne';
    }
  ) {
    super();
  }

  async exec() {
    const collection = await this.collection.collection;
    const filterDocument = this.createFilterQuery();
    const { _useMongoUpdateFilterOperators, ...updateDocument } =
      this.updateDocument;

    return collection[this.options.updateType](
      filterDocument,
      { $set: updateDocument as never, ..._useMongoUpdateFilterOperators },
      this.options.nativeMongoUpdateOptions
    );
  }
}

export default MongoDbUpdate;
