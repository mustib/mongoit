import { AbstractFind } from './AbstractFind.js';

import type { Document } from 'mongodb';

import type {
  Collection,
  CrudOptions,
  FilterDocumentWithId,
} from '../../index.js';

export class FindOne<
  MongoitDocument extends Document
> extends AbstractFind<MongoitDocument> {
  constructor(
    protected collection: Collection<MongoitDocument>,
    protected filterDocument?: Promise<FilterDocumentWithId<MongoitDocument>>,
    protected options?: CrudOptions<MongoitDocument>['findOne']
  ) {
    super();
  }

  protected cursorLimit = 1;

  async exec() {
    const cursor = await this.createCursor();
    const doc = await cursor.next();
    cursor.close();

    return doc;
  }
}
