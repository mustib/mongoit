import MongoDbSanitize from '../../MongoDbSanitize.js';

import {
  allOperators,
  getFilteringOperatorsByTypes,
  filteringOperatorsTypesHandlersObject,
  filteringOperatorsAsKeysWithTypesAsValues,
} from '../../utils/filteringOperators.js';

import type { FilterQueryObject } from '../../types/FilterQueryObject.js';
import type MongoDbSchema from '../../MongoDbSchema/MongoDbSchema.js';

import type {
  Operators,
  FilterOperatorHandler,
} from '../../utils/filteringOperators.js';

class MongoDbQueryFilter {
  protected _filtered: UntypedObject[] = [];

  protected hasFiltered = false;

  get filtered(): Promise<typeof this._filtered> {
    return new Promise((resolve) => {
      if (this.hasFiltered) resolve(this._filtered);
      this.startFiltering().then(() => {
        this.hasFiltered = true;
        resolve(this._filtered);
      });
    });
  }

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
      target = new MongoDbSanitize({ target }, 'target');
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
  }

  async convertToSchemaType(key: string, value: any) {
    return this.shouldUseSchema
      ? this.schema?.convertValueToSchemaTypeByKey(key, value)
      : value;
  }

  async addEqualOperator(key: string, value: unknown) {
    const _value = await this.convertToSchemaType(key, value);

    const filtered = filteringOperatorsTypesHandlersObject.asValue(
      '$eq',
      key,
      _value
    ) as UntypedObject;

    this._filtered.push(filtered);
  }

  async addOperatorIfAllowed(
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

    const _value = await this.convertToSchemaType(key, value);

    const filtered = operatorHandler(mongoOperator, key, _value);

    this._filtered.push(filtered as UntypedObject);
  }

  async addAllowedOperatorsFromObject(key: string, operators: object) {
    if (typeof operators !== 'object') return;

    const operatorsEntries = Object.entries(operators) as [
      Operators<'WithoutDollarSign'>,
      unknown
    ][];

    for await (const [operator, operatorValue] of operatorsEntries) {
      await this.addOperatorIfAllowed(operator, key, operatorValue);
    }
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

  private async startFiltering() {
    for await (const allowedKey of this.allowedTargetKeys) {
      const [allowedTargetKey, allowedTargetKeyAsAlias = allowedTargetKey] =
        allowedKey.split(': ');

      const operatorValue = this.getOperatorValue(allowedTargetKey);

      if (operatorValue === undefined) continue;

      if (typeof operatorValue !== 'object') {
        await this.addEqualOperator(allowedTargetKeyAsAlias, operatorValue);
        continue;
      }

      if (Array.isArray(operatorValue)) {
        await this.addOperatorIfAllowed(
          'or',
          allowedTargetKeyAsAlias,
          operatorValue
        );
        continue;
      }

      await this.addAllowedOperatorsFromObject(
        allowedTargetKeyAsAlias,
        operatorValue
      );
    }
  }
}

export default MongoDbQueryFilter;
