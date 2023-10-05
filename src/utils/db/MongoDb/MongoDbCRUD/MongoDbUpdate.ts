import AbstractMongoDbFilterDocument from './MongoDbFilterDocument/AbstractMongoDbFilterDocument.js';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../MongoDBCollection.js';
import type { CollectionCrudOptions } from '../types/CollectionConfigOptions.js';
import type { UpdateFilterDocument } from '../types/UpdateFilterDocument.js';
import type { FilterDocumentWithId } from '../types/FilterDocumentWithId.js';

class MongoDbUpdate<
  Document extends MongoDocument
> extends AbstractMongoDbFilterDocument<Document> {
  protected query: Document[] = [];

  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument: FilterDocumentWithId<Document>,
    protected updateDocument: UpdateFilterDocument<Document>,
    protected options: CollectionCrudOptions<Document>['updateOptions'] & {
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
