import AbstractMongoDbFilterDocument from './MongoDbFilterDocument/AbstractMongoDbFilterDocument';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../MongoDBCollection';
import type { CollectionConfigOptions } from '../types/CollectionConfigOptions';
import type { FilterDocumentWithId } from '../types/FilterDocumentWithId';

class MongoDbDelete<
  Document extends MongoDocument
> extends AbstractMongoDbFilterDocument<Document> {
  protected query: Document[] = [];

  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument: FilterDocumentWithId<Document>,
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
