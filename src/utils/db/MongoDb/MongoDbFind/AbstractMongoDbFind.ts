import { ObjectId } from 'mongodb';

import MongoDbFindFilter from '../MongoDbFindFilter';

import type {
  Document as _MongoDocument,
  Collection,
  Filter,
  FindCursor,
  SortDirection,
} from 'mongodb';

import type { FindFilterObject } from '../types/FindFilterObject';
import type { CollectionConfigOptions } from '../types/CollectionConfigOptions';

type MongoQuerySort<Document extends _MongoDocument & UntypedObject> =
  | {
      [key in keyof Document]: SortDirection;
    }
  | [keyof Document, SortDirection]
  | [keyof Document, SortDirection][];

function convertDocumentIdToString(doc: _MongoDocument) {
  const _id = doc._id.toString();
  // eslint-disable-next-line no-param-reassign
  doc._id = _id;
  return doc;
}

const convertStringToObjectId = (id: string) =>
  ObjectId.isValid(id) ? new ObjectId(id) : id;

abstract class AbstractMongoDbFind<Document extends _MongoDocument> {
  protected query: Document[] = [];

  protected hasSorted = false;

  protected sortObject: {
    sort?: MongoQuerySort<Document>;
    direction?: SortDirection;
  } = {};

  protected abstract options?: CollectionConfigOptions[
    | 'findOptions'
    | 'findOneOptions'];

  protected abstract collection: Promise<Collection<Document>>;

  protected abstract filterDocument?: Filter<Document & { _id?: string }>;

  private addFilterDocumentToQuery() {
    if (typeof this.filterDocument !== 'object') return;

    // convert id from a string to ObjectID in the filtered documents
    if ('_id' in this.filterDocument) {
      const convertedObjectIdFromString = convertStringToObjectId(
        this.filterDocument._id as string
      ) as never;

      this.filterDocument._id = convertedObjectIdFromString;
    }

    this.query.push(this.filterDocument as Document);
  }

  private createFilterQuery() {
    this.addFilterDocumentToQuery();

    const filterQuery = this.query.length > 0 ? { $and: this.query } : {};

    return filterQuery;
  }

  private addSortToCursor(cursor: FindCursor) {
    if (this.hasSorted) {
      cursor.sort(this.sortObject.sort as never, this.sortObject.direction);
    }
  }

  protected async createCursor() {
    const collection = await this.collection;
    const filterQuery = this.createFilterQuery();

    const cursor = collection.find<Document & { _id: string }>(
      filterQuery,
      this.options
    );

    this.addSortToCursor(cursor);
    cursor.map(convertDocumentIdToString);

    return cursor;
  }

  filter(filter: FindFilterObject) {
    const { filtered } = new MongoDbFindFilter(filter);

    if (filtered.length > 0) {
      if (this.query.length === 0) this.query = filtered as Document[];
      else this.query.push({ $and: filtered } as unknown as Document);
    }

    return this;
  }

  sort(sort: MongoQuerySort<Document>, direction: SortDirection = 1) {
    this.hasSorted = true;
    this.sortObject.sort = sort;
    this.sortObject.direction = direction;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract exec(...params: any[]): Promise<any>;
}

export default AbstractMongoDbFind;
