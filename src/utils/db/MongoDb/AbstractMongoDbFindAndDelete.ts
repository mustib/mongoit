import { ObjectId } from 'mongodb';
import MongoDbFindFilter from './MongoDbFindFilter';

import type { Document as MongoDocument, Filter } from 'mongodb';
import type MongoDBCollection from './MongoDBCollection';
import type { FindFilterObject } from './types/FindFilterObject';

const convertToObjectIdIfValid = (id: any) =>
  ObjectId.isValid(id) ? new ObjectId(id) : id;

abstract class AbstractMongoDbFindAndDelete<Document extends MongoDocument> {
  protected query: Document[] = [];

  protected abstract collection: MongoDBCollection<Document>;

  protected abstract filterDocument?: Filter<Document & { _id?: string }>;

  private addFilterDocumentToQuery() {
    if (typeof this.filterDocument !== 'object') return;

    // convert id from a string to ObjectID in the filtered documents
    if ('_id' in this.filterDocument) {
      const convertedObjectIdFromString = convertToObjectIdIfValid(
        this.filterDocument._id
      );

      this.filterDocument._id = convertedObjectIdFromString;
    }

    this.query.push(this.filterDocument as Document);
  }

  protected createFilterQuery() {
    this.addFilterDocumentToQuery();

    const filterQuery = this.query.length > 0 ? { $and: this.query } : {};

    return filterQuery;
  }

  filter(filter: FindFilterObject) {
    const { filtered } = new MongoDbFindFilter(filter);

    if (filtered.length > 0) {
      if (this.query.length === 0) this.query = filtered as Document[];
      else this.query.push({ $and: filtered } as unknown as Document);
    }

    return this;
  }

  abstract exec(...params: any[]): any;
}

export default AbstractMongoDbFindAndDelete;
