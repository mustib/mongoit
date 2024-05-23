import { getTypeof } from '@mustib/utils';
import AbstractMongoDbFind from './AbstractMongoDbFind.js';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../../MongoDBCollection.js';
import type { CollectionCrudOptions } from '../../types/CollectionConfigOptions.js';
import type { FilterDocumentWithId } from '../../types/FilterDocumentWithId.js';

type MongoDbFindExecOptions = {
  returnDetails?: boolean;
};

type MongoDbFindExecReturn<
  Options extends MongoDbFindExecOptions,
  Document extends MongoDocument
> = Promise<
  Options['returnDetails'] extends false
  ? {
    documents: (Document & {
      _id: string;
    })[];
  }
  : ReturnType<MongoDbFind<Document>['execDetails']>
>;

class MongoDbFind<
  Document extends MongoDocument
> extends AbstractMongoDbFind<Document> {
  protected cursorLimit = 20;

  protected pageNumber = 1;

  protected get cursorSkipCount() {
    return (this.pageNumber - 1) * this.cursorLimit;
  }

  constructor(
    protected collection: MongoDBCollection<Document>,
    protected filterDocument?: Promise<FilterDocumentWithId<Document>>,
    protected options?: CollectionCrudOptions<Document>['findOptions']
  ) {
    super();

    const cursorLimit = options?.nativeMongoFindOptions?.limit;

    if (cursorLimit !== undefined && cursorLimit > 0)
      this.cursorLimit = cursorLimit;
  }

  toPage(_pageNumber: number, _resultsPerPage = this.cursorLimit) {
    const pageNumber = +_pageNumber;

    if (getTypeof(pageNumber) !== 'number' || pageNumber < 1) return this;

    this.pageNumber = pageNumber;

    this.cursorLimit =
      +_resultsPerPage > 0 ? +_resultsPerPage : this.cursorLimit;

    return this;
  }

  private async countDocuments() {
    const collection = await this.collection.collection;
    const query = await this.createFilterQuery();
    const count = await collection.countDocuments(query);

    return count;
  }

  protected async execDetails(
    documents: (Document & {
      _id: string;
    })[]
  ) {
    const allResultsCount = await this.countDocuments();
    const currentResultsCount = documents.length;
    const { pageNumber, cursorLimit: resultsPerPage } = this;
    const remainingResults =
      allResultsCount - (this.cursorSkipCount + currentResultsCount);
    const numberOfPages = Math.ceil(allResultsCount / resultsPerPage);

    return {
      allResultsCount,
      currentResultsCount,
      documents,
      pageNumber,
      resultsPerPage,
      remainingResults,
      numberOfPages,
    };
  }

  // TODO: Implement cursor paradigms. REFERENCE https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/cursor/
  async exec<Options extends MongoDbFindExecOptions>(
    options?: Options
  ): MongoDbFindExecReturn<Options, Document> {
    const cursor = await this.createCursor();
    cursor.skip(this.cursorSkipCount);
    const documents = await cursor.toArray();
    cursor.close();

    if (options?.returnDetails === false) return { documents } as never;

    const execDetails = await this.execDetails(documents);

    return execDetails as never;
  }
}

export default MongoDbFind;
