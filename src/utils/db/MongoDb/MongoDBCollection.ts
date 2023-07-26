import mergeTwoObjects from '../../mergeTwoObjects';
import MongoDbFind from './MongoDbFind/MongoDbFind';
import MongoDbFindOne from './MongoDbFind/MongoDbFindOne';

import type { Collection, Document as MongoDocument, Filter } from 'mongodb';
import type { CollectionConfigOptions } from './types/CollectionConfigOptions';

class MongoDBCollection<Document extends MongoDocument> {
  protected static configOptions: Required<CollectionConfigOptions> = {
    findOptions: { limit: 20 },
    findOneOptions: {},
  };

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

  find(
    document?: Filter<Document & { _id?: string }>,
    options?: CollectionConfigOptions['findOptions']
  ) {
    const findOptions = this.getConfigOption('findOptions', options);
    const mongoDbFind = new MongoDbFind(this.collection, document, findOptions);

    return mongoDbFind;
  }

  findOne(
    document?: Filter<Document & { _id?: string }>,
    options?: CollectionConfigOptions['findOneOptions']
  ) {
    const findOptions = this.getConfigOption('findOneOptions', options);

    const mongoDbFindOne = new MongoDbFindOne(
      this.collection,
      document,
      findOptions
    );

    return mongoDbFindOne;
  }

  findById(id: string) {
    return this.findOne({ _id: id as never }).exec();
  }
}

export default MongoDBCollection;
