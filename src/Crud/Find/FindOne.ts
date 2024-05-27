import { AbstractFind } from './AbstractFind.js';

import type { Document as MongoDocument } from 'mongodb';

import type { Collection, CrudOptions, FilterDocumentWithId } from '../../types/index.js';

export class FindOne<
  Document extends MongoDocument
> extends AbstractFind<Document> {
  constructor(
    protected collection: Collection<Document>,
    protected filterDocument?: Promise<FilterDocumentWithId<Document>>,
    protected options?: CrudOptions<Document>['findOne']
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

