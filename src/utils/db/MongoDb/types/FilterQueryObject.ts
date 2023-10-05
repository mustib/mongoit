import type MongoSanitize from '../MongoDbSanitize.js';
import type {
  Operators,
  FilteringOperatorsTypes,
} from '../utils/filteringOperators.js';

type SharedQueryObject<T> = {
  /**
   * @description a string separated by ', ' or an array of string containing key with optionally alias separated by ': ' as follow 'key: alias'
   * @example "key1: alias1, key2: alias2" || ["key1: alias1", "key2: alias2"]
   */
  allowedTargetKeys?: // eslint-disable-next-line @typescript-eslint/ban-types
  (keyof T | (string & {}))[] | (keyof T | (string & {}));
};

export type FilterQueryObject<T extends UntypedObject = UntypedObject> =
  SharedQueryObject<T> & {
    /**
     * @description should be an instanceof MongoDbSanitize
     */
    target: T | MongoSanitize<T>;

    /**
     * @description defaults to true if there is schema, unless it's value === false
     */
    shouldUseSchema?: boolean;

    /**
     * @description an array of strings including allowed operators without dollar signs, or a string defining allowed operators by it's type
     */
    allowedOperators?:
      | Operators<'WithoutDollarSign'>[]
      | keyof FilteringOperatorsTypes;

    /**
     * @description if true and target is not an instanceof MongoDbSanitize, sanitize target
     */
    shouldSanitizeTarget?: boolean;

    /**
     * @description disable console warning if target is not an instanceof MongoDbSanitize
     */
    disableSanitizeWarning?: boolean;
  };

export type SortQueryObject<T> = SharedQueryObject<T> & {
  /**
   * @description a string consist of three parts:
   *
   * 1- field name, 2- semicolon, 3- sort direction -> the same as mongo.
   *
   * if there are more than sort target then separated by a comma with no spaces
   *
   * @example
   * const field1 = 'price';
   * const field2 = 'reviews';
   * const sortTarget = `${field1}:asc,${field2}:dec`;
   */
  target: string;
};
