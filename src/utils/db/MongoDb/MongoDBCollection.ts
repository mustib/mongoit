import mergeTwoObjects from '../../mergeTwoObjects.js';
import MongoDbFind from './MongoDbCRUD/MongoDbFind/MongoDbFind.js';
import MongoDbFindOne from './MongoDbCRUD/MongoDbFind/MongoDbFindOne.js';
import MongoDbSchema from './MongoDbSchema/MongoDbSchema.js';
import MongoDbInsert from './MongoDbCRUD/MongoDbInsert/MongoDbInsert.js';
import MongoDbInsertOne from './MongoDbCRUD/MongoDbInsert/MongoDbInsertOne.js';
import MongoDbDelete from './MongoDbCRUD/MongoDbDelete.js';
import MongoDbUpdate from './MongoDbCRUD/MongoDbUpdate.js';

import type {
  Collection,
  Document as MongoDocument,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type { CollectionCrudOptions } from './types/CollectionConfigOptions.js';
import type { MongoSchema } from './MongoDbSchema/types/MongoDBSchema.js';
import type { UpdateFilterDocument } from './types/UpdateFilterDocument.js';
import type { FilterDocumentWithId } from './types/FilterDocumentWithId.js';

type _useFieldsFromSchema<Document extends MongoDocument> =
  | {
      _useFieldsFromSchema?: Partial<Document>;
    }
  | undefined;

/**
 * Tail<T> is a utility type that returns a tuple type with the first element removed from T.
 * T must be an array type, otherwise the result is never.
 *
 * @example
 * type T0 = Tail<[1, 2, 3]>; // [2, 3]
 * type T1 = Tail<string[]>; // string[]
 * type T2 = Tail<[]>; // []
 * type T3 = Tail<number>; // never
 */
type Tail<T extends any[]> = ((...t: T) => void) extends (
  x: any,
  ...u: infer U
) => void
  ? U
  : never;

class MongoDBCollection<Document extends MongoDocument> {
  protected static crudOptions: Required<CollectionCrudOptions<MongoDocument>> =
    {
      findOptions: {},
      findOneOptions: {},
      insertOptions: {},
      insertOneOptions: {},
      deleteOptions: {},
      updateOptions: {},
    };

  schema: MongoDbSchema<Document> | null = null;

  static setCrudOptions(options: CollectionCrudOptions<MongoDocument>) {
    mergeTwoObjects(
      MongoDBCollection.crudOptions,
      options as UntypedObject,
      true
    );
  }

  setCrudOptions(options: CollectionCrudOptions<Document>) {
    mergeTwoObjects(
      this.crudOptions as UntypedObject,
      options as UntypedObject,
      true
    );

    return this;
  }

  protected getConfigOption<
    T extends keyof CollectionCrudOptions<MongoDocument>
  >(
    option: T,
    possibleOption: CollectionCrudOptions<MongoDocument>[T] | undefined
  ): CollectionCrudOptions<MongoDocument>[T] {
    if (typeof possibleOption === 'object') return possibleOption;

    const configOption =
      option in this.crudOptions
        ? this.crudOptions[option]
        : MongoDBCollection.crudOptions[option];

    return configOption as never;
  }

  constructor(
    readonly collection: Promise<Collection<Document>>,
    protected crudOptions: CollectionCrudOptions<Document> = {}
  ) {}

  createSchema(schema: MongoSchema<Document>) {
    this.schema = new MongoDbSchema(schema);
    return this;
  }

  prepareSchemaFields<Type extends 'convert' | 'validate'>(
    document: _useFieldsFromSchema<MongoDocument>,
    type = 'convert' as Type,
    ...args: Type extends 'validate'
      ? Tail<Parameters<(typeof MongoDbSchema)['prototype']['validate']>>
      : never[]
  ) {
    if (document !== undefined && '_useFieldsFromSchema' in document) {
      const { _useFieldsFromSchema } = document;
      // eslint-disable-next-line no-param-reassign
      delete document._useFieldsFromSchema;

      Object.assign(
        document,
        type === 'convert'
          ? this.schema?.convertValuesToSchemaTypes(_useFieldsFromSchema as any)
          : this.schema?.validate(_useFieldsFromSchema as any, ...args)
      );
    }
  }

  find<Doc extends MongoDocument = Document>(
    document?: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    options?: CollectionCrudOptions<Doc>['findOptions']
  ) {
    this.prepareSchemaFields(document);

    const findOptions = this.getConfigOption('findOptions', options);
    const mongoDbFind = new MongoDbFind<Doc>(
      this as never,
      document,
      findOptions
    );

    return mongoDbFind;
  }

  findOne<Doc extends MongoDocument = Document>(
    document?: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    options?: CollectionCrudOptions<Doc>['findOneOptions']
  ) {
    this.prepareSchemaFields(document);

    const findOptions = this.getConfigOption('findOneOptions', options);
    const mongoDbFindOne = new MongoDbFindOne<Doc>(
      this as never,
      document,
      findOptions
    );

    return mongoDbFindOne;
  }

  findById<Doc extends MongoDocument = Document>(
    id: string,
    options?: CollectionCrudOptions<Doc>['findOneOptions']
  ) {
    return this.findOne({ _id: id } as never, options).exec();
  }

  insert<Doc extends MongoDocument = Document>(
    docs: OptionalUnlessRequiredId<Doc>[],
    options?: CollectionCrudOptions<Doc>['insertOptions']
  ) {
    const _options = this.getConfigOption('insertOptions', options);

    const mongoDbInsert = new MongoDbInsert(this as never, docs, _options);

    return mongoDbInsert;
  }

  insertOne<Doc extends MongoDocument = Document>(
    document: OptionalUnlessRequiredId<Doc>,
    options?: CollectionCrudOptions<Doc>['insertOneOptions']
  ) {
    const _options = this.getConfigOption('insertOneOptions', options);

    const mongoDbInsertOne = new MongoDbInsertOne<Doc>(
      this as never,
      document,
      _options as never
    );

    return mongoDbInsertOne;
  }

  delete<Doc extends MongoDocument = Document>(
    document: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    options?: CollectionCrudOptions<Doc>['deleteOptions']
  ) {
    const _options = this.getConfigOption(
      'deleteOptions',
      options
    ) as MongoDbDelete<Doc>['options'];

    _options.deleteType = 'deleteMany';

    this.prepareSchemaFields(document);

    const mongoDbDelete = new MongoDbDelete<Doc>(
      this as never,
      document,
      _options
    );

    return mongoDbDelete;
  }

  deleteOne<Doc extends MongoDocument = Document>(
    document: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    options?: CollectionCrudOptions<Doc>['deleteOptions']
  ) {
    const _options = this.getConfigOption(
      'deleteOptions',
      options
    ) as MongoDbDelete<Doc>['options'];

    _options.deleteType = 'deleteOne';

    this.prepareSchemaFields(document);

    const mongoDbDelete = new MongoDbDelete<Doc>(
      this as never,
      document,
      _options
    );

    return mongoDbDelete;
  }

  deleteById<Doc extends MongoDocument = Document>(
    id: string,
    options?: CollectionCrudOptions<Doc>['deleteOptions']
  ) {
    return this.deleteOne<Doc>({ _id: id } as never, options).exec();
  }

  update<Doc extends MongoDocument = Document>(
    filterDocument: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    updateDocument: UpdateFilterDocument<Doc> & _useFieldsFromSchema<Doc>,
    options?: CollectionCrudOptions<Doc>['updateOptions']
  ) {
    const _options = this.getConfigOption(
      'updateOptions',
      options
    ) as MongoDbUpdate<Doc>['options'];

    _options.updateType = 'updateMany';

    this.prepareSchemaFields(filterDocument);
    this.prepareSchemaFields(updateDocument, 'validate', 'PARTIAL');

    const mongoDbUpdate = new MongoDbUpdate<Doc>(
      this as never,
      filterDocument,
      updateDocument,
      _options
    );

    return mongoDbUpdate;
  }

  updateOne<Doc extends MongoDocument = Document>(
    filterDocument: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    updateDocument: UpdateFilterDocument<Doc> & _useFieldsFromSchema<Doc>,
    options?: CollectionCrudOptions<Doc>['updateOptions']
  ) {
    const _options = this.getConfigOption(
      'updateOptions',
      options
    ) as MongoDbUpdate<Doc>['options'];

    _options.updateType = 'updateOne';

    this.prepareSchemaFields(filterDocument);
    this.prepareSchemaFields(updateDocument, 'validate', 'PARTIAL');

    const mongoDbUpdate = new MongoDbUpdate<Doc>(
      this as never,
      filterDocument,
      updateDocument,
      _options
    );

    return mongoDbUpdate;
  }

  updateById<Doc extends MongoDocument = Document>(
    id: string,
    updateDocument: UpdateFilterDocument<Doc> & _useFieldsFromSchema<Doc>,
    options?: CollectionCrudOptions<Doc>['updateOptions']
  ) {
    return this.updateOne<Doc>(
      { _id: id } as never,
      updateDocument,
      options
    ).exec();
  }
}

export default MongoDBCollection;
