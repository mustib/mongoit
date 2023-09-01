import {
  InsertOneResult,
  WithId,
  Document as MongoDocument,
  InsertManyResult,
} from 'mongodb';

export type ExecOptions = {
  /**
   * @description a boolean indicates whether to return back the inserted documents or not
   */
  returnInserted?: boolean;
};

export type InsertOneExecReturn<
  Options extends ExecOptions,
  Document extends MongoDocument
> = Options['returnInserted'] extends false
  ? InsertOneResult<Document>
  : WithId<Document>;

export type InsertManyExecReturn<
  Options extends ExecOptions,
  Document extends MongoDocument
> = Options['returnInserted'] extends true
  ? WithId<Document>[]
  : InsertManyResult<Document>;
