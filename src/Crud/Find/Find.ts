import { getTypeof } from '@mustib/utils';

import { AbstractFind } from './AbstractFind.js';

import type { Document } from 'mongodb';

import type {
  Collection,
  CrudOptions,
  FilterDocumentWithId,
} from '../../index.js';

type FindExecOptions = {
  returnDetails?: boolean;
};

type FindExecReturn<
  Options extends FindExecOptions,
  MongoitDocument extends Document
> = Promise<
  Options['returnDetails'] extends false
    ? {
        documents: (MongoitDocument & {
          _id: string;
        })[];
      }
    : ReturnType<Find<MongoitDocument>['execDetails']>
>;

export class Find<
  MongoitDocument extends Document
> extends AbstractFind<MongoitDocument> {
  protected cursorLimit = 20;

  protected pageNumber = 1;

  protected get cursorSkipCount() {
    return (this.pageNumber - 1) * this.cursorLimit;
  }

  constructor(
    protected collection: Collection<MongoitDocument>,
    protected filterDocument?: Promise<FilterDocumentWithId<MongoitDocument>>,
    protected options?: CrudOptions<MongoitDocument>['find']
  ) {
    super();

    const cursorLimit = options?.nativeMongoOptions?.limit;

    if (cursorLimit !== undefined && cursorLimit > 0)
      this.cursorLimit = cursorLimit;
  }

  toPage(_pageNumber: number, _resultsPerPage = this.cursorLimit) {
    const pageNumber = +_pageNumber;

    if (getTypeof(pageNumber) === 'number' && pageNumber > 0) {
      this.pageNumber = pageNumber;

      if (+_resultsPerPage > 0) this.cursorLimit = +_resultsPerPage;
    }

    return this;
  }

  private async countDocuments() {
    const collection = await this.collection.collection;
    const query = await this.createFilterQuery();
    const count = await collection.countDocuments(query);

    return count;
  }

  protected async execDetails(
    documents: (MongoitDocument & {
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
  async exec<Options extends FindExecOptions>(
    options?: Options
  ): FindExecReturn<Options, MongoitDocument> {
    const cursor = await this.createCursor();
    cursor.skip(this.cursorSkipCount);
    const documents = await cursor.toArray();
    cursor.close();

    if (options?.returnDetails === false) return { documents } as never;

    const execDetails = await this.execDetails(documents);

    return execDetails as never;
  }
}
