import type { UpdateFilter, Document } from 'mongodb';

export type UpdateFilterDocument<MongoitDocument extends Document> =
  UpdateFilter<MongoitDocument>['$set'] & {
    _useMongoUpdateFilterOperators?: UpdateFilter<MongoitDocument>;
  };
