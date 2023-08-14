import AbstractMongoDbFindAndDelete from '../AbstractMongoDbFindAndDelete';

import type {
  Document as MongoDocument,
  FindCursor,
  SortDirection,
} from 'mongodb';

import type { CollectionConfigOptions } from '../types/CollectionConfigOptions';

type MongoQuerySort<Document extends MongoDocument & UntypedObject> =
  | {
      [key in keyof Document]: SortDirection;
    }
  | [keyof Document, SortDirection]
  | [keyof Document, SortDirection][];

function convertDocumentIdToString(doc: MongoDocument) {
  if ('_id' in doc) {
    const _id = doc._id.toString();
    // eslint-disable-next-line no-param-reassign
    doc._id = _id;
  }
  return doc;
}

abstract class AbstractMongoDbFind<
  Document extends MongoDocument
> extends AbstractMongoDbFindAndDelete<Document> {
  protected query: Document[] = [];

  protected hasSorted = false;

  protected sortObject: {
    sort?: MongoQuerySort<Document>;
    direction?: SortDirection;
  } = {};

  protected abstract options?: CollectionConfigOptions[
    | 'findOptions'
    | 'findOneOptions'];

  private addSortToCursor(cursor: FindCursor) {
    if (this.hasSorted) {
      cursor.sort(this.sortObject.sort as never, this.sortObject.direction);
    }
  }

  protected async createCursor() {
    const collection = await this.collection.collection;
    const filterQuery = this.createFilterQuery();

    const cursor = collection.find<Document & { _id: string }>(
      filterQuery,
      this.options
    );

    this.addSortToCursor(cursor);
    cursor.map(convertDocumentIdToString);

    return cursor;
  }

  sort(sort: MongoQuerySort<Document>, direction: SortDirection = 1) {
    this.hasSorted = true;
    this.sortObject.sort = sort;
    this.sortObject.direction = direction;
    return this;
  }
}

export default AbstractMongoDbFind;
