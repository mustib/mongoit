import EventEmitter from 'node:events';

import { MongoClient } from 'mongodb';

import { type TypedEventEmitter, AppError } from '@mustib/utils/node';

import { Collection } from './Collection.js';

import type {
  Db,
  DbOptions,
  MongoClientOptions,
  Document as MongoDocument,
} from 'mongodb';

import type { CollectionOptions } from './index.js';

type MongoitConnectionOptions = {
  /**
   * @description client options used when instantiating new MongoClient()
   */
  nativeMongoClientOptions?: MongoClientOptions;

  /**
   * @description database options used when connecting client.db()
   */
  nativeMongoDbOptions?: DbOptions;

  /**
   * @description database name used when connecting client.db()
   */
  nativeMongoDbName?: string;

  /**
   * @description id used when retrieving instantiated Mongoit
   */
  mongoitID?: string | number;
};

/**
 * @description instantiate new Mongoit class and add it to the private static property instantiatedMongoits that is used later to retrieve it by the static getMongoit() method by its provided id or the first instantiated Mongoit if no id is provided
 */
export class Mongoit<Collections extends string[] = string[]> {
  /**
   * @description an object that contains all instantiated Mongoit classes
   */
  private static instantiatedMongoits = { byID: {} } as {
    /**
     * @description the first instantiated Mongoit class whether by id or not
     */
    main: Mongoit | undefined;

    /**
     * @description an object that contains all instantiated Mongoit classes by their id
     */
    byID: {
      [key: Required<MongoitConnectionOptions>['mongoitID']]:
        | Mongoit
        | undefined;
    };
  };

  /**
   * @description a static method that is used to save the instantiated Mongoit to the static property instantiatedMongoits
   * @param mongoit is the newly instantiated Mongoit class
   * @param id an optional id, that is used to retrieve the instantiated Mongoit class later. useful when instantiating more than one Mongoit
   */
  protected static addToInstantiatedMongoits(
    mongoit: Mongoit,
    id?: MongoitConnectionOptions['mongoitID']
  ) {
    let hasBeenAdded = false;

    const isMainMongoit = Mongoit.instantiatedMongoits.main === undefined;

    if (isMainMongoit) {
      Mongoit.instantiatedMongoits.main = mongoit;
      hasBeenAdded = true;
    }

    if (id !== undefined) {
      const isAddedBefore = Mongoit.instantiatedMongoits.byID[id] !== undefined;

      if (isAddedBefore)
        AppError.throw('Duplicated ID', `duplicated Mongoit id (${id})`);

      Mongoit.instantiatedMongoits.byID[id] = mongoit;
      hasBeenAdded = true;
    }

    if (!hasBeenAdded)
      // eslint-disable-next-line no-console
      console.warn(
        `currently instantiated Mongoit hasn't been successfully added to the instantiated mongoits list,
        which means you cant't access it with Mongoit.getMongoit() method,
        the main reason for this warning is instantiating more than Mongoit without defining an id,
        and the only way for you to use this Mongoit is by saving the reference object of the instantiated class.
        make sure to add a mongoitID option if you are using more than one mongoit`
      );
  }

  /**
   * @description a static method to retrieve previously instantiated Mongoit classes
   * @param id an optional id that is used to retrieve instantiated Mongoit classes with their provided mongoitID option
   * @returns instantiated Mongoit by their id or the first instantiated one if no id
   */
  static getMongoit<Collections extends string[] = string[]>(
    id?: MongoitConnectionOptions['mongoitID']
  ) {
    const mongoit: Mongoit<Collections> | undefined =
      id === undefined
        ? Mongoit.instantiatedMongoits.main
        : Mongoit.instantiatedMongoits.byID[id];

    if (mongoit === undefined) {
      AppError.throw(
        'Undefined',
        `no previously instantiated Mongoit classes founded to retrieve${
          id !== undefined ? ` with the id (${id})` : ''
        },
        make sure you instantiated it first, then try again`
      );
    }

    return mongoit;
  }

  private eventEmitter = new EventEmitter() as TypedEventEmitter<{
    dbConnected: { db: Db };
  }>;

  readonly db = new Promise<Db>((resolve) => {
    this.eventEmitter.once('dbConnected', ({ db }) => resolve(db));
  });

  /**
   *
   * @param uri mongo connection string
   * @param options an optional object to configure both the native mongo client and instantiated Mongoit class
   */
  constructor(uri: string, options?: MongoitConnectionOptions) {
    const {
      nativeMongoClientOptions,
      nativeMongoDbName,
      nativeMongoDbOptions,
      mongoitID,
    } = options || {};

    const mongoClient = new MongoClient(uri, nativeMongoClientOptions);

    mongoClient
      .connect()
      .then((client) => client.db(nativeMongoDbName, nativeMongoDbOptions))
      .then((db) => {
        this.eventEmitter.emit('dbConnected', { db });
      });

    Mongoit.addToInstantiatedMongoits(this, mongoitID);
  }

  /**
   * @description instantiate a new Mongoit Collection class and return it
   * @param name mongo collection name to connect to
   * @param options an optional object to configure both the native mongo collection and instantiated Collection class
   * @returns new Collection()
   */
  getCollection<Schema extends MongoDocument & { _id?: string }>(
    name: Collections[number],
    options?: CollectionOptions<Schema>
  ) {
    const collection = this.db.then((db) =>
      db.collection<Schema>(name, options?.nativeMongoCollectionOptions)
    );

    return new Collection<Schema>(collection, options?.MongoitCollection);
  }
}
