import {
  InsertOneResult,
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
  : Document & {
      _id: string;
    };

export type InsertManyExecReturn<
  Options extends ExecOptions,
  Document extends MongoDocument
> = Options['returnInserted'] extends true
  ? (Document & {
      _id: string;
    })[]
  : InsertManyResult<Document>;
