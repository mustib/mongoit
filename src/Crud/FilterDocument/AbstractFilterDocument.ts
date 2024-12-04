import { ObjectId } from 'mongodb';

import { QueryFilter } from './QueryFilter.js';

import type { Document } from 'mongodb';

import type {
  Collection,
  FilterQueryObject,
  FilterDocumentWithId,
} from '../../index.js';

const convertToObjectIdIfValid = (id: any) =>
  ObjectId.isValid(id) ? new ObjectId(id) : id;

abstract class AbstractMongoDbFilterDocument<MongoitDocument extends Document> {
  protected query: MongoitDocument[] = [];

  protected queryFilter: Promise<MongoitDocument>[] = [];

  protected abstract collection: Collection<MongoitDocument>;

  protected abstract filterDocument?: Promise<
    FilterDocumentWithId<MongoitDocument>
  >;

  private filterDocumentAddedToQuery = false;

  private async addFilterDocumentToQuery() {
    const filterDocument = await this.filterDocument;

    if (typeof filterDocument !== 'object' || this.filterDocumentAddedToQuery)
      return;

    // convert id from a string to ObjectID in the filtered documents
    if ('_id' in filterDocument) {
      const convertedObjectIdFromString = convertToObjectIdIfValid(
        filterDocument._id
      );

      filterDocument._id = convertedObjectIdFromString;
    }

    this.query.push(filterDocument as MongoitDocument);
    this.filterDocumentAddedToQuery = true;
  }

  protected async createFilterQuery() {
    await this.addFilterDocumentToQuery();

    if (this.queryFilter.length > 0) {
      const filtered = await Promise.all(this.queryFilter);
      if (this.query.length === 0) this.query = filtered;
      else this.query.push({ $and: filtered } as never);
    }

    const filterQuery = this.query.length > 0 ? { $and: this.query } : {};

    return filterQuery;
  }

  filter(filter: FilterQueryObject) {
    const { filtered } = new QueryFilter(filter, this.collection.schema);

    this.queryFilter.push(filtered as never);

    return this;
  }

  abstract exec(...params: any[]): any;
}

export default AbstractMongoDbFilterDocument;
