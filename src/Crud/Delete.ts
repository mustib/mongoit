import AbstractMongoDbFilterDocument from './FilterDocument/AbstractFilterDocument.js';

import type { Document } from 'mongodb';

import type {
  CrudOptions,
  FilterDocumentWithId,
  Collection,
} from '../index.js';

export class Delete<
  MongoitDocument extends Document
> extends AbstractMongoDbFilterDocument<MongoitDocument> {
  protected query: MongoitDocument[] = [];

  constructor(
    protected collection: Collection<MongoitDocument>,
    protected filterDocument: Promise<FilterDocumentWithId<MongoitDocument>>,
    protected options: CrudOptions<MongoitDocument>['delete'] & {
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
