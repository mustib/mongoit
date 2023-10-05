import AbstractMongoDbFilterDocument from '../MongoDbFilterDocument/AbstractMongoDbFilterDocument.js';

import type { Document as MongoDocument } from 'mongodb';

import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions.js';
import type { SortQueryObject } from '../../types/FilterQueryObject.js';

function convertDocumentIdToString(doc: MongoDocument) {
  if ('_id' in doc) {
    const _id = doc._id.toString();
    // eslint-disable-next-line no-param-reassign
    doc._id = _id;
  }
  return doc;
}

const sortDirections = ['asc', 'desc', 'ascending', 'descending', '1', '-1'];

abstract class AbstractMongoDbFind<
  Document extends MongoDocument
> extends AbstractMongoDbFilterDocument<Document> {
  protected query: Document[] = [];

  protected sortObject?: UntypedObject;

  protected abstract options?: CollectionCrudOptions<Document>[
    | 'findOptions'
    | 'findOneOptions'];

  protected abstract readonly cursorLimit: number;

  protected async createCursor() {
    const collection = await this.collection.collection;
    const filterQuery = this.createFilterQuery();

    const cursor = collection.find<Document & { _id: string }>(
      filterQuery,
      this.options?.nativeMongoFindOptions
    );

    if (this.sortObject !== undefined) {
      cursor.sort(this.sortObject);
    }

    cursor.limit(this.cursorLimit);
    cursor.map(convertDocumentIdToString);

    if (this.options?.interceptAfterFinding)
      cursor.map(this.options.interceptAfterFinding);

    return cursor;
  }

  sort(sortQueryObject: SortQueryObject<Document>) {
    const { target } = sortQueryObject;

    if (typeof target !== 'string') return this;

    const allowedTargetKeys = (
      typeof sortQueryObject.allowedTargetKeys === 'string'
        ? sortQueryObject.allowedTargetKeys.split(', ')
        : sortQueryObject.allowedTargetKeys
    ) as undefined | string[];

    const sortArray = target.split(',');

    this.sortObject = sortArray.reduce((result, sort) => {
      const [sortKey, sortDirection] = sort.split(':');

      if (!sortDirections.includes(sortDirection)) return result;

      if (allowedTargetKeys !== undefined) {
        for (let i = 0; i < allowedTargetKeys.length; i++) {
          const [key, alias = key] = allowedTargetKeys[i].split(': ');
          if (key === sortKey) {
            // eslint-disable-next-line no-param-reassign
            result[alias] = sortDirection;
            break;
          }
        }
      } else {
        // eslint-disable-next-line no-param-reassign
        result[sortKey] = sortDirection;
      }
      return result;
    }, {} as UntypedObject);

    return this;
  }
}

export default AbstractMongoDbFind;
