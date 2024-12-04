import AbstractMongoDbFilterDocument from './FilterDocument/AbstractFilterDocument.js';

import type { Document } from 'mongodb';

import type {
  CrudOptions,
  UpdateFilterDocument,
  FilterDocumentWithId,
  Collection,
} from '../index.js';

export class Update<
  MongoitDocument extends Document
> extends AbstractMongoDbFilterDocument<MongoitDocument> {
  protected query: MongoitDocument[] = [];

  constructor(
    protected collection: Collection<MongoitDocument>,
    protected filterDocument: Promise<FilterDocumentWithId<MongoitDocument>>,
    protected updateDocument: Promise<UpdateFilterDocument<MongoitDocument>>,
    protected options: CrudOptions<MongoitDocument>['update'] & {
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
