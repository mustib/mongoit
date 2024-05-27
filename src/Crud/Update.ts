import AbstractMongoDbFilterDocument from './FilterDocument/AbstractFilterDocument.js';

import type { Document as MongoDocument } from 'mongodb';

import type { Collection } from '../Collection.js';

import type {
  CrudOptions,
  UpdateFilterDocument,
  FilterDocumentWithId,
} from '../types/index.js';

export class Update<
  Document extends MongoDocument
> extends AbstractMongoDbFilterDocument<Document> {
  protected query: Document[] = [];

  constructor(
    protected collection: Collection<Document>,
    protected filterDocument: Promise<FilterDocumentWithId<Document>>,
    protected updateDocument: Promise<UpdateFilterDocument<Document>>,
    protected options: CrudOptions<Document>['update'] & {
      updateType: 'updateMany' | 'updateOne';
    }
  ) {
    super();
  }

  async exec() {
    const collection = await this.collection.collection;
    const filterDocument = await this.createFilterQuery();
    const { _useMongoUpdateFilterOperators, ...updateDocument } = await this
      .updateDocument;

    return collection[this.options.updateType](
      filterDocument,
      { $set: updateDocument as never, ..._useMongoUpdateFilterOperators },
      this.options.nativeMongoOptions
    );
  }
}
