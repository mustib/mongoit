import type { Filter, Document as MongoDocument } from 'mongodb';

export type FilterDocumentWithId<Document extends MongoDocument> = {
  [K in keyof Filter<Document>]: K extends '_id' ? string : Filter<Document>[K];
};
