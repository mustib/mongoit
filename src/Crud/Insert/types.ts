import type { InsertOneResult, Document, InsertManyResult } from 'mongodb';

export type ExecOptions = {
  /**
   * @description a boolean indicates whether to return back the inserted documents or not
   */
  returnInserted?: boolean;
};

export type InsertOneExecReturn<
  Options extends ExecOptions,
  MongoitDocument extends Document
> = Options['returnInserted'] extends false
  ? InsertOneResult<MongoitDocument>
  : MongoitDocument & {
      _id: string;
    };

export type InsertManyExecReturn<
  Options extends ExecOptions,
  MongoitDocument extends Document
> = Options['returnInserted'] extends true
  ? (MongoitDocument & {
      _id: string;
    })[]
  : InsertManyResult<MongoitDocument>;
