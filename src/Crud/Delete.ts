import AbstractMongoDbFilterDocument from './FilterDocument/AbstractFilterDocument.js';

import type { Document as MongoDocument } from 'mongodb';

import type { CrudOptions, FilterDocumentWithId, Collection } from '../index.js';

export class Delete<
  Document extends MongoDocument
> extends AbstractMongoDbFilterDocument<Document> {
  protected query: Document[] = [];

  constructor(
    protected collection: Collection<Document>,
    protected filterDocument: Promise<FilterDocumentWithId<Document>>,
    protected options: CrudOptions<Document>['delete'] & {
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
      this.options?.nativeMongoOptions
    );

    return deleteResult;
  }
}
