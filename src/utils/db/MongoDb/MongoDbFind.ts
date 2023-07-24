import MongoDbFindFilter from './MongoDbFindFilter';

import type {
  Document as _MongoDocument,
  Collection,
  Filter,
  FindCursor,
  SortDirection,
} from 'mongodb';

import type { FindFilterObject } from './types/FindFilterObject';
import type { CollectionConfigOptions } from './types/CollectionConfigOptions';

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

class MongoDbFind<Document extends _MongoDocument> {
  protected query: Document[] = [];

  protected hasSorted = false;

  protected sortObject: {
    sort?: MongoQuerySort<Document>;
    direction?: SortDirection;
  } = {};

  protected hasPaginated = false;

  protected paginationObject: { pageNumber?: number; resultsPerPage?: number } =
    {};

  constructor(
    protected collection: Promise<Collection<Document>>,
    protected filterDocument?: Filter<Document & { _id?: string }>,
    protected options?: CollectionConfigOptions['findOptions']
  ) {}

  private createFilterDocument() {
    if (typeof this.filterDocument === 'object') {
      // convert id from a string to ObjectID in the filtered documents
      if ('_id' in this.filterDocument) {
        // @ts-expect-error assigning ObjectId to a string
        this.filterDocument._id = objectIdFromString(this.filterDocument._id);
      }

      this.query.push(this.filterDocument as Document);
    }

    const filterDocument = this.query.length > 0 ? { $and: this.query } : {};

    return filterDocument;
  }

  private addSortAndPaginateToCursor(cursor: FindCursor) {
    if (this.hasSorted) {
      cursor.sort(this.sortObject.sort as never, this.sortObject.direction);
    }

    if (this.hasPaginated) {
      const page = this.paginationObject.pageNumber as number;
      const results = this.paginationObject.resultsPerPage as number;
      const skip = (page - 1) * results;
      cursor.skip(skip);
    }
  }

  private async createCursor() {
    const collection = await this.collection;
    const filterDocument = this.createFilterDocument();

    const cursor = collection.find<Document & { _id: string }>(
      filterDocument,
      this.options
    );

    this.addSortAndPaginateToCursor(cursor);
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

  toPage(pageNumber = 1, resultsPerPage = 20) {
    this.hasPaginated = true;
    this.paginationObject.pageNumber = pageNumber;
    this.paginationObject.resultsPerPage = resultsPerPage;
    return this;
  }

  // TODO: Implement cursor paradigms. REFERENCE https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/cursor/
  async exec() {
    const cursor = await this.createCursor();
    const documents = await cursor.toArray();

    return documents;
  }
}

export default MongoDbFind;
