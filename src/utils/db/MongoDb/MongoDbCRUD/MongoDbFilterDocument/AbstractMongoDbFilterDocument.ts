import { ObjectId } from 'mongodb';
import MongoDbQueryFilter from './MongoDbQueryFilter.js';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../../MongoDBCollection.js';
import type { FilterQueryObject } from '../../types/FilterQueryObject.js';
import type { FilterDocumentWithId } from '../../types/FilterDocumentWithId.js';

const convertToObjectIdIfValid = (id: any) =>
  ObjectId.isValid(id) ? new ObjectId(id) : id;

abstract class AbstractMongoDbFilterDocument<Document extends MongoDocument> {
  protected query: Document[] = [];

  protected queryFilter: Promise<Document>[] = [];

  protected abstract collection: MongoDBCollection<Document>;

  protected abstract filterDocument?: Promise<FilterDocumentWithId<Document>>;

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

    this.query.push(filterDocument as Document);
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
    const { filtered } = new MongoDbQueryFilter(filter, this.collection.schema);

    this.queryFilter.push(filtered as never);

    return this;
  }

  abstract exec(...params: any[]): any;
}

export default AbstractMongoDbFilterDocument;
