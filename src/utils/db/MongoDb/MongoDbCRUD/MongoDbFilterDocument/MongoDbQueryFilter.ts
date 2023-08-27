import MongoDbSanitize from '../../MongoDbSanitize';

import {
  allOperators,
  getFilteringOperatorsByTypes,
  filteringOperatorsTypesHandlersObject,
  filteringOperatorsAsKeysWithTypesAsValues,
} from '../../utils/filteringOperators';

import type { FilterQueryObject } from '../../types/FilterQueryObject';
import type MongoDbSchema from '../../MongoDbSchema/MongoDbSchema';

import type {
  Operators,
  FilterOperatorHandler,
} from '../../utils/filteringOperators';

class MongoDbQueryFilter {
  filtered: UntypedObject[] = [];

  protected allowedTargetKeys: string[];

  protected target: MongoDbSanitize<UntypedObject>;

  protected allowedOperators: Operators<'WithoutDollarSign'>[];

  protected shouldUseSchema = false;

  constructor(
    filter: FilterQueryObject,
    protected schema: MongoDbSchema<UntypedObject> | null
  ) {
    const { shouldSanitizeTarget, disableSanitizeWarning, shouldUseSchema } =
      filter;

    let { allowedTargetKeys, target, allowedOperators = allOperators } = filter;
    const isSanitized = target instanceof MongoDbSanitize;

    if (shouldUseSchema !== false && schema !== undefined) {
      this.shouldUseSchema = true;
    }

    if (shouldSanitizeTarget === true && !isSanitized) {
      target = new MongoDbSanitize(target as UntypedObject);
    } else if (!isSanitized && disableSanitizeWarning !== true) {
      const messageWithYellowBackgroundAndBlackText =
        '\x1b[43m\x1b[30m WARNING: find filter is not an instance of MongoDbSanitize \x1b[0m';
      // eslint-disable-next-line no-console
      console.warn(messageWithYellowBackgroundAndBlackText);
    }

    if (typeof allowedTargetKeys === 'string') {
      const allowedTargetKeysAsArray = allowedTargetKeys.split(', ');
      allowedTargetKeys = allowedTargetKeysAsArray;
    }

    if (typeof allowedOperators === 'string') {
      const operatorsByType = getFilteringOperatorsByTypes(allowedOperators);
      allowedOperators = operatorsByType;
    }

    this.allowedTargetKeys =
      allowedTargetKeys !== undefined
        ? (allowedTargetKeys as string[])
        : Object.keys(filter.target);

    this.target = target as never;
    this.allowedOperators = allowedOperators;

    this.startFiltering();
  }

  protected convertToSchemaType(key: string, value: any) {
    return this.shouldUseSchema
      ? this.schema?.convertValueToSchemaTypeByKey(key, value)
      : value;
  }

  addEqualOperator(key: string, value: unknown) {
    const _value = this.convertToSchemaType(key, value);

    const filtered = filteringOperatorsTypesHandlersObject.asValue(
      '$eq',
      key,
      _value
    ) as UntypedObject;

    this.filtered.push(filtered);
  }

  addOperatorIfAllowed(
    operator: Operators<'WithoutDollarSign'>,
    key: string,
    value: unknown
  ) {
    const isAllowed = this.allowedOperators.includes(operator);
    if (!isAllowed) return;

    const operatorType = filteringOperatorsAsKeysWithTypesAsValues[operator];

    const operatorHandler = filteringOperatorsTypesHandlersObject[
      operatorType
    ] as FilterOperatorHandler;

    const mongoOperator = `$${operator}` as Operators<'WithDollarSign'>;

    const _value = this.convertToSchemaType(key, value);

    const filtered = operatorHandler(mongoOperator, key, _value);

    this.filtered.push(filtered as UntypedObject);
  }

  addAllowedOperatorsFromObject(key: string, operators: object) {
    if (typeof operators !== 'object') return;

    const operatorsEntries = Object.entries(operators) as [
      Operators<'WithoutDollarSign'>,
      unknown
    ][];

    operatorsEntries.forEach(([operator, operatorValue]) => {
      this.addOperatorIfAllowed(operator, key, operatorValue);
    });
  }

  private getOperatorValue(allowedTargetKey: string) {
    let operatorValue: any;

    if (this.target instanceof MongoDbSanitize) {
      operatorValue = this.target.get([allowedTargetKey])[allowedTargetKey];
    } else if (typeof this.target === 'object') {
      operatorValue = this.target[allowedTargetKey];
    }

    return operatorValue;
  }

  private startFiltering() {
    this.allowedTargetKeys.forEach((allowedKey) => {
      const [allowedTargetKey, allowedTargetKeyAsAlias = allowedTargetKey] =
        allowedKey.split(': ');

      const operatorValue = this.getOperatorValue(allowedTargetKey);

      if (operatorValue === undefined) return;

      if (typeof operatorValue !== 'object') {
        this.addEqualOperator(allowedTargetKeyAsAlias, operatorValue);
        return;
      }

      if (Array.isArray(operatorValue)) {
        this.addOperatorIfAllowed('or', allowedTargetKeyAsAlias, operatorValue);
        return;
      }

      this.addAllowedOperatorsFromObject(
        allowedTargetKeyAsAlias,
        operatorValue
      );
    });
  }
}

export default MongoDbQueryFilter;
