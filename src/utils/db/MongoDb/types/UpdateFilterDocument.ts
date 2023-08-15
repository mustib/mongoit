import type { UpdateFilter, Document as MongoDocument } from 'mongodb';

export type UpdateFilterDocument<Document extends MongoDocument> =
  UpdateFilter<Document>['$set'] & {
    _useMongoUpdateFilterOperators?: UpdateFilter<Document>;
  };
