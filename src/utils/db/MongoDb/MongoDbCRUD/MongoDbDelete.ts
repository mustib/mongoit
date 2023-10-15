import AbstractMongoDbFilterDocument from './MongoDbFilterDocument/AbstractMongoDbFilterDocument.js';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../MongoDBCollection.js';
import type { CollectionCrudOptions } from '../types/CollectionConfigOptions.js';
import type { FilterDocumentWithId } from '../types/FilterDocumentWithId.js';

class MongoDbDelete<
  Document extends MongoDocument
> extends AbstractMongoDbFilterDocument<Document> {
  protected query: Document[] = [];

  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument: Promise<FilterDocumentWithId<Document>>,
    protected options: CollectionCrudOptions<Document>['deleteOptions'] & {
      deleteType: 'deleteOne' | 'deleteMany';
    }
  ) {
    super();
  }

  async exec() {
    const collection = await this.collection.collection;
    const query = await this.createFilterQuery();
    const deleteResult = await collection[this.options.deleteType](
      query,
      this.options?.nativeMongoDeleteOptions
    );

    return deleteResult;
  }
}

export default MongoDbDelete;
