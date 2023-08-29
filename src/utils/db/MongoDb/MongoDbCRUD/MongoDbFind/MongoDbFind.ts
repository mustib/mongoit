import AbstractMongoDbFind from './AbstractMongoDbFind';

import type { Document as MongoDocument } from 'mongodb';
import type MongoDBCollection from '../../MongoDBCollection';
import type { CollectionConfigOptions } from '../../types/CollectionConfigOptions';
import type { FilterDocumentWithId } from '../../types/FilterDocumentWithId';

type MongoDbFindExecOptions = {
  returnDetails?: boolean;
};

type MongoDbFindExecReturn<Options extends MongoDbFindExecOptions> = Promise<
  Options['returnDetails'] extends false
    ? {
        documents: (Document & {
          _id: string;
        })[];
      }
    : ReturnType<(typeof MongoDbFind)['prototype']['execDetails']>
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
    protected filterDocument?: FilterDocumentWithId<Document>,
    protected options?: CollectionConfigOptions['findOptions']
  ) {
    super();

    const cursorLimit = options?.nativeMongoFindOptions?.limit;

    if (cursorLimit !== undefined && cursorLimit > 0)
      this.cursorLimit = cursorLimit;
  }

  toPage(pageNumber = this.pageNumber, _resultsPerPage = this.cursorLimit) {
    if (+pageNumber < 1) return this;

    this.pageNumber = +pageNumber;

    this.cursorLimit =
      +_resultsPerPage > 0 ? +_resultsPerPage : this.cursorLimit;

    return this;
  }

  private async countDocuments() {
    const collection = await this.collection.collection;
    const query = this.createFilterQuery();
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
  ): MongoDbFindExecReturn<Options> {
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
