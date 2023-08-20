import type {
  Operators,
  FilteringOperatorsTypes,
} from '../utils/filteringOperators';

export type FilterQueryObject = {
  /**
   * @description a string separated by ', ' or an array of string containing key with optionally alias separated by ': ' as follow 'key: alias'
   * @example "key1: alias1, key2: alias2" || ["key1: alias1", "key2: alias2"]
   */
  allowedTargetKeys: string[] | string;

  /**
   * @description should be an instanceof MongoDbSanitize
   */
  target: UntypedObject;

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
