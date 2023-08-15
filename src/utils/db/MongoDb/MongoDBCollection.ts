import mergeTwoObjects from '../../mergeTwoObjects';
import MongoDbFind from './MongoDbFind/MongoDbFind';
import MongoDbFindOne from './MongoDbFind/MongoDbFindOne';
import MongoDbSchema from './MongoDbSchema/MongoDbSchema';
import MongoDbInsert from './MongoDbInsert';
import MongoDbDelete from './MongoDbDelete';
import MongoDbUpdate from './MongoDbUpdate';

import type {
  Collection,
  Document as MongoDocument,
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
} from 'mongodb';

import type { CollectionConfigOptions } from './types/CollectionConfigOptions';
import type { MongoSchema } from './MongoDbSchema/types/MongoDBSchema';

class MongoDBCollection<Document extends MongoDocument> {
  protected static configOptions: Required<CollectionConfigOptions> = {
    findOptions: { limit: 20 },
    findOneOptions: {},
    insertOptions: {},
    insertOneOptions: {},
    deleteOptions: {},
    updateOptions: {},
  };

  schema: MongoDbSchema<Document> | null = null;

  static setConfigOptions(options: CollectionConfigOptions) {
    mergeTwoObjects(
      MongoDBCollection.configOptions,
      options as UntypedObject,
      true
    );
  }

  setConfigOptions(options: CollectionConfigOptions) {
    mergeTwoObjects(
      this.configOptions as UntypedObject,
      options as UntypedObject,
      true
    );

    return this;
  }

  protected getConfigOption<T extends keyof CollectionConfigOptions>(
    option: T,
    possibleOption: CollectionConfigOptions[T] | undefined
  ): CollectionConfigOptions[T] {
    if (typeof possibleOption === 'object') return possibleOption;

    const configOption =
      option in this.configOptions
        ? this.configOptions[option]
        : MongoDBCollection.configOptions[option];

    return configOption;
  }

  constructor(
    readonly collection: Promise<Collection<Document>>,
    protected configOptions: CollectionConfigOptions = {}
  ) {}

  createSchema(schema: MongoSchema<Document>) {
    this.schema = new MongoDbSchema(schema);
    return this;
  }

  find(
    document?: Filter<Document & { _id?: string }>,
    options?: CollectionConfigOptions['findOptions']
  ) {
    const findOptions = this.getConfigOption('findOptions', options);
    const mongoDbFind = new MongoDbFind(this, document, findOptions);

    return mongoDbFind;
  }

  findOne(
    document?: Filter<Document & { _id?: string }>,
    options?: CollectionConfigOptions['findOneOptions']
  ) {
    const findOptions = this.getConfigOption('findOneOptions', options);
    const mongoDbFindOne = new MongoDbFindOne(this, document, findOptions);

    return mongoDbFindOne;
  }

  findById(id: string) {
    return this.findOne({ _id: id as never }).exec();
  }

  insert(
    docs: OptionalUnlessRequiredId<Document>[],
    options?: CollectionConfigOptions['insertOptions']
  ) {
    const _options = this.getConfigOption(
      'insertOptions',
      options
    ) as MongoDbInsert<Document>['options'];

    _options.insertType = 'insertMany';
    const mongoDbInsert = new MongoDbInsert(this, docs, _options);

    return mongoDbInsert;
  }

  insertOne(
    document: OptionalUnlessRequiredId<Document>,
    options?: CollectionConfigOptions['insertOneOptions']
  ) {
    const _options = this.getConfigOption(
      'insertOneOptions',
      options
    ) as MongoDbInsert<Document>['options'];

    _options.insertType = 'insertOne';
    const mongoDbInsertOne = new MongoDbInsert(this, [document], _options);

    return mongoDbInsertOne;
  }

  delete(
    document: Filter<Document & { _id?: string }>,
    options?: CollectionConfigOptions['deleteOptions']
  ) {
    const _options = this.getConfigOption(
      'deleteOptions',
      options
    ) as MongoDbDelete<Document>['options'];

    _options.deleteType = 'deleteMany';
    const mongoDbDelete = new MongoDbDelete(this, document, _options);

    return mongoDbDelete;
  }

  deleteOne(
    document: Filter<Document & { _id?: string }>,
    options?: CollectionConfigOptions['deleteOptions']
  ) {
    const _options = this.getConfigOption(
      'deleteOptions',
      options
    ) as MongoDbDelete<Document>['options'];

    _options.deleteType = 'deleteOne';
    const mongoDbDelete = new MongoDbDelete(this, document, _options);

    return mongoDbDelete;
  }

  deleteById(id: string) {
    return this.deleteOne({ _id: id as never }).exec();
  }

  update(
    filterDocument: Filter<Document & { _id?: string }>,
    updateDocument: UpdateFilter<Document>,
    options?: CollectionConfigOptions['updateOptions']
  ) {
    const _options = this.getConfigOption(
      'updateOptions',
      options
    ) as MongoDbUpdate<Document>['options'];

    _options.updateType = 'updateMany';
    const mongoDbUpdate = new MongoDbUpdate(
      this,
      filterDocument,
      updateDocument,
      _options
    );

    return mongoDbUpdate;
  }

  updateOne(
    filterDocument: Filter<Document & { _id?: string }>,
    updateDocument: UpdateFilter<Document>,
    options?: CollectionConfigOptions['updateOptions']
  ) {
    const _options = this.getConfigOption(
      'updateOptions',
      options
    ) as MongoDbUpdate<Document>['options'];

    _options.updateType = 'updateOne';
    const mongoDbUpdate = new MongoDbUpdate(
      this,
      filterDocument,
      updateDocument,
      _options
    );

    return mongoDbUpdate;
  }
}

export default MongoDBCollection;
