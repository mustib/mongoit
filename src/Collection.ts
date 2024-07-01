import { mergeTwoObjects, getTypeof } from '@mustib/utils';

import { Find, FindOne, Insert, InsertOne, Update, Delete } from './Crud/index.js';

import { Schema } from './Schema/index.js';

import type {
  Collection as MongoCollection,
  Document as MongoDocument,
  OptionalUnlessRequiredId,
} from 'mongodb';

import type {
  UpdateFilterDocument,
  FilterDocumentWithId,
  CollectionOptions,
  CrudOptions,
  MongoitSchema,
  MongoitSchemaDocument,
} from './index.js';

type _useFieldsFromSchema<Document extends MongoDocument> =
  | {
    _useFieldsFromSchema?: Partial<Document>;
  }
  | undefined;

type RemoveFirstElementFromArray<Arr extends any[]> = ((...args: Arr) => void) extends (
  firstArg: any,
  ...restArgs: infer T
) => void
  ? T
  : never;

export class Collection<Document extends MongoDocument> {
  schema: Schema<Document> | null = null;


  /**
   * @description default global crud options
   */
  protected static crudOptions: Required<CrudOptions<MongoDocument>> =
    {
      find: {},
      findOne: {},
      insert: {},
      insertOne: {},
      delete: {},
      update: {},
    };


  /**
   * @description Add options to the global crud options.
   *
   */
  static addCrudOptions(options: CrudOptions<MongoDocument>) {
    mergeTwoObjects(
      Collection.crudOptions,
      options,
      true
    );
  }

  get crudOptions() {
    return this.options?.crudOptions || {}
  }

  constructor(
    readonly collection: Promise<MongoCollection<Document>>,
    protected options: CollectionOptions<Document>['MongoitCollection'] = {}
  ) { }


  /**
   * @description Add options to the collection crud options.
   *
   */
  addCrudOptions(options: CrudOptions<Document>) {
    mergeTwoObjects(
      this.crudOptions,
      options,
      true
    );

    return this;
  }


  /**
   * @description get crud option value by name
   * 
   * @param crudOptionName crud option name to get its value from the collection crudOptions or global crudOptions
   * 
   * @param userProvidedOption if the user provided it, it will be used instead of the collection crudOptions
   * 
   * @returns userProvidedOption if provided, otherwise crudOptionName value from the collection crudOptions if it exists or from  global crudOptions if it doesn't exist in the collection
   */
  protected getCrudOptionByName<
    T extends keyof CrudOptions<MongoDocument>
  >(
    crudOptionName: T,
    userProvidedOption: CrudOptions<MongoDocument>[T] | undefined
  ): CrudOptions<MongoDocument>[T] {
    if (getTypeof(userProvidedOption) === 'object') return userProvidedOption;

    const configOption =
      crudOptionName in this.crudOptions
        ? this.crudOptions[crudOptionName]
        : Collection.crudOptions[crudOptionName];

    return configOption as never;
  }

  defineSchema(schema: MongoitSchema<Document>) {
    this.schema = new Schema(schema);
    return this;
  }


  /**
   * convert or validate schema fields from _useFieldsFromSchema property in the document if it exists,
   * then add convert or validate result to the document.
   *
   * @param {Doc & _useFieldsFromSchema<MongoDocument>} document - The document to add schema fields to.
   * @param {'convert' | 'validate'} [type='convert'] - The type of schema validation to perform on the document. Either 'convert' or 'validate'.
   * @param args - rest arguments that will be passed to schema validation function depending on the type ('convert' or 'validate').
   * @returns {Promise<Doc>} - The document with schema fields added if _useFieldsFromSchema property exists otherwise the original document.
   */
  async addSchemaFieldsToFilterDocument<Doc, Type extends 'convert' | 'validate'>(
    document: Doc & _useFieldsFromSchema<MongoDocument>,
    type = 'convert' as Type,
    ...args: Type extends 'validate'
      ? RemoveFirstElementFromArray<Parameters<(typeof Schema)['prototype']['validate']>>
      : never[]
  ): Promise<Doc> {
    if (document !== undefined && '_useFieldsFromSchema' in document) {
      const { _useFieldsFromSchema } = document;
      // eslint-disable-next-line no-param-reassign
      delete document._useFieldsFromSchema;

      return Object.assign(
        document,
        type === 'convert'
          ? await this.schema?.convertValuesToSchemaTypes(
            _useFieldsFromSchema as any
          )
          : await this.schema?.validate(
            _useFieldsFromSchema as any,
            ...(args as never[])
          )
      );
    }

    return document;
  }

  find<Doc extends MongoDocument = Document>(
    document?: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    options?: CrudOptions<Doc>['find']
  ) {
    const findOptions = this.getCrudOptionByName('find', options);

    const find = new Find<Doc>(
      this as never,
      this.addSchemaFieldsToFilterDocument(document as FilterDocumentWithId<Doc>),
      findOptions
    );

    return find;
  }

  findOne<Doc extends MongoDocument = Document>(
    document?: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    options?: CrudOptions<Doc>['findOne']
  ) {
    const findOptions = this.getCrudOptionByName('findOne', options);

    const findOne = new FindOne<Doc>(
      this as never,
      this.addSchemaFieldsToFilterDocument(document as FilterDocumentWithId<Doc>),
      findOptions
    );

    return findOne;
  }

  findById<Doc extends MongoDocument = Document>(
    id: string,
    options?: CrudOptions<Doc>['findOne']
  ) {
    return this.findOne({ _id: id } as never, options).exec();
  }

  insert<Doc extends MongoDocument = Document>(
    docs: OptionalUnlessRequiredId<MongoitSchemaDocument<Doc>>[],
    options?: CrudOptions<Doc>['insert']
  ) {
    const _options = this.getCrudOptionByName('insert', options);

    const insert = new Insert<Doc>(
      this as never,
      docs,
      _options as never
    );

    return insert;
  }

  insertOne<Doc extends MongoDocument = Document>(
    document: OptionalUnlessRequiredId<MongoitSchemaDocument<Doc>>,
    options?: CrudOptions<Doc>['insertOne']
  ) {
    const _options = this.getCrudOptionByName('insertOne', options);

    const insertOne = new InsertOne<Doc>(
      this as never,
      document,
      _options as never
    );

    return insertOne;
  }

  delete<Doc extends MongoDocument = Document>(
    document: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    options?: CrudOptions<Doc>['delete']
  ) {
    const _options = this.getCrudOptionByName(
      'delete',
      options
    ) as Delete<Doc>['options'];

    _options.deleteType = 'deleteMany';

    const _delete = new Delete<Doc>(
      this as never,
      this.addSchemaFieldsToFilterDocument(document),
      _options
    );

    return _delete;
  }

  deleteOne<Doc extends MongoDocument = Document>(
    document: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    options?: CrudOptions<Doc>['delete']
  ) {
    const _options = this.getCrudOptionByName(
      'delete',
      options
    ) as Delete<Doc>['options'];

    _options.deleteType = 'deleteOne';

    const _delete = new Delete<Doc>(
      this as never,
      this.addSchemaFieldsToFilterDocument(document),
      _options
    );

    return _delete;
  }

  deleteById<Doc extends MongoDocument = Document>(
    id: string,
    options?: CrudOptions<Doc>['delete']
  ) {
    return this.deleteOne<Doc>({ _id: id } as never, options).exec();
  }

  update<Doc extends MongoDocument = Document>(
    filterDocument: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    updateDocument: UpdateFilterDocument<Doc> & _useFieldsFromSchema<Doc>,
    options?: CrudOptions<Doc>['update']
  ) {
    const _options = this.getCrudOptionByName(
      'update',
      options
    ) as Update<Doc>['options'];

    _options.updateType = 'updateMany';

    const update = new Update<Doc>(
      this as never,
      this.addSchemaFieldsToFilterDocument(filterDocument),
      this.addSchemaFieldsToFilterDocument(updateDocument, 'validate', 'PARTIAL'),
      _options
    );

    return update;
  }

  updateOne<Doc extends MongoDocument = Document>(
    filterDocument: FilterDocumentWithId<Doc> & _useFieldsFromSchema<Doc>,
    updateDocument: UpdateFilterDocument<Doc> & _useFieldsFromSchema<Doc>,
    options?: CrudOptions<Doc>['update']
  ) {
    const _options = this.getCrudOptionByName(
      'update',
      options
    ) as Update<Doc>['options'];

    _options.updateType = 'updateOne';

    const update = new Update<Doc>(
      this as never,
      this.addSchemaFieldsToFilterDocument(filterDocument),
      this.addSchemaFieldsToFilterDocument(updateDocument, 'validate', 'PARTIAL'),
      _options
    );

    return update;
  }

  updateById<Doc extends MongoDocument = Document>(
    id: string,
    updateDocument: UpdateFilterDocument<Doc> & _useFieldsFromSchema<Doc>,
    options?: CrudOptions<Doc>['update']
  ) {
    return this.updateOne<Doc>(
      { _id: id } as never,
      updateDocument,
      options
    ).exec();
  }
}
