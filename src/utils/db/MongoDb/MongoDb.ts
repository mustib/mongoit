import { EventEmitter } from 'events';
import { MongoClient } from 'mongodb';
import MongoDBCollection from './MongoDBCollection';
import MongoSanitize from './MongoDbSanitize';

import type { NextFunction, Request, Response } from 'express';

import type {
  Db,
  DbOptions,
  MongoClientOptions,
  Document as MongoDocument,
} from 'mongodb';

import type { CollectionConfigOptions } from './types/CollectionConfigOptions';

type MongoConnectionOptions = {
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
   * @description id used when retrieving instantiated MongoDb
   */
  dbID?: string | number;
};

class MongoDb<Collections extends string[] = string[]> {
  private static connectedDatabases = { byID: {} } as {
    main: MongoDb | undefined;
    byID: { [key: string]: MongoDb | undefined };
  };

  private eventEmitter = new EventEmitter();

  private hasConnected = false;

  private _db: Db | undefined;

  /**
   * @description an express middleware that is used to sanitize only the needed props from req.body, req.query and req.params by adding sanitizeMongo property to the request object, sanitizeMongo is an object containing three properties body, query and params, and each of them has a get method that takes no arguments to sanitize all fields or take an array of keys to retrieve that keys values from the original request object and sanitize them
   */
  static sanitize(req: Request, _: Response, next: NextFunction) {
    req.sanitizeMongo = {
      body: new MongoSanitize(req, 'body'),
      query: new MongoSanitize(req, 'query'),
      params: new MongoSanitize(req, 'params'),
    };

    next();
  }

  /**
   * @description a static method that is used to save the created MongoDb to the connectedDatabases
   * @param db is the newly instantiated MongoDb class
   * @param id an optional id, that is used to retrieve instantiated MongoDb class later. useful when instantiating more than one MongoDb class
   */
  protected static addDB(db: MongoDb, id?: MongoConnectionOptions['dbID']) {
    let hasBeenAdded = false;

    const isMainDb = MongoDb.connectedDatabases.main === undefined;

    if (isMainDb) {
      MongoDb.connectedDatabases.main = db;
      hasBeenAdded = true;
    }

    if (id !== undefined) {
      const isAddedBefore = MongoDb.connectedDatabases.byID[id] !== undefined;

      if (isAddedBefore) throw new Error('duplicated database id');

      MongoDb.connectedDatabases.byID[id] = db;
      hasBeenAdded = true;
    }

    if (!hasBeenAdded)
      // eslint-disable-next-line no-console
      console.warn(
        "currently instantiated mongo database hasn't successfully added to the connected databases list, which means you cant't access it with getMongoDb() method on MongoDb, make sure to add a dbID option if you are creating more than one database"
      );
  }

  /**
   * @description a static method to retrieve the connected MongoDbs objects
   * @param id an optional id that is used to retrieve instantiated MongoDb classes with their provided dbID option
   * @returns the connected MongoDb by their id or the first connected one if no id
   */
  static getMongoDb<Collections extends string[] = string[]>(
    id?: string | number
  ) {
    let db: MongoDb<Collections> | undefined;

    if (id === undefined) db = this.connectedDatabases.main;

    if (id !== undefined && MongoDb.connectedDatabases.byID[id] !== undefined)
      db = MongoDb.connectedDatabases.byID[id];

    if (db === undefined) {
      throw new Error(
        `no mongo database founded, make sure you instantiated it first, ${
          id !== undefined
            ? `or check you didn't misspelled the provided id '${id}'`
            : ''
        }`
      );
    }

    return db;
  }

  constructor(uri: string, Options?: MongoConnectionOptions) {
    const {
      nativeMongoClientOptions,
      nativeMongoDbName,
      nativeMongoDbOptions,
      dbID,
    } = Options || {};

    const mongoClient = new MongoClient(uri, nativeMongoClientOptions);

    mongoClient
      .connect()
      .then((client) => client.db(nativeMongoDbName, nativeMongoDbOptions))
      .then((db) => {
        this._db = db;
        this.hasConnected = true;
        this.eventEmitter.emit('dbConnected');
      });

    MongoDb.addDB(this, dbID);
  }

  /**
   * @description a getter method for the original mongo db object
   */
  get db() {
    if (!this.hasConnected || this._db === undefined)
      throw new Error(
        'database has not been connected yet, if you want to use it before it\'s connection to be ready, try using "dbAsPromise" instead'
      );
    return this._db;
  }

  /**
   * @description a getter method for the original mongo db object as a promise
   */
  get dbAsPromise(): Promise<Db> {
    return new Promise((resolve) => {
      if (this.hasConnected) resolve(this._db as Db);
      this.eventEmitter.on('dbConnected', () => resolve(this._db as Db));
    });
  }

  /**
   *
   * @param name mongo collection name to connect to
   * @param options an optional object to configure both the native mongo collection and MongoDBCollection class
   * @returns new MongoDBCollection()
   */
  getCollection<Schema extends MongoDocument & { _id?: string }>(
    name: Collections[number],
    options?: CollectionConfigOptions
  ) {
    const db = this.dbAsPromise;
    const collection = db.then((_db) =>
      _db.collection<Schema>(name, options?.nativeMongoCollectionOptions)
    );

    return new MongoDBCollection<Schema>(
      collection,
      options?.MongoDbCollectionConfigOptions
    );
  }
}

export default MongoDb;
