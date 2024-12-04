import type { Filter, Document } from 'mongodb';

export type FilterDocumentWithId<MongoitDocument extends Document> = {
  [K in keyof Filter<MongoitDocument>]: K extends '_id'
    ? string
    : Filter<MongoitDocument>[K];
};
