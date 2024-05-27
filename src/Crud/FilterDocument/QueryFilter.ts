import { Sanitize } from '../../Sanitize.js';

import {
  allFilterOperators,
  getFilteringOperatorsByTypes,
  filteringOperatorsTypesHandlersObject,
  filteringOperatorsAsKeysWithTypesAsValues,
} from './filteringOperators.js';

import type {
  Schema,
  FilterOperators,
  FilterQueryObject,
  FilterOperatorHandler,
} from '../../types/index.js'

export class QueryFilter {
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

  protected target: Sanitize<UntypedObject>;

  protected allowedOperators: FilterOperators<'WithoutDollarSign'>[];

  protected shouldUseSchema = false;

  constructor(
    filter: FilterQueryObject,
    protected schema: Schema<UntypedObject> | null
  ) {
    const { shouldSanitizeTarget, disableSanitizeWarning, shouldUseSchema } =
      filter;

    let { allowedTargetKeys, target, allowedOperators = allFilterOperators } = filter;
    const isSanitized = target instanceof Sanitize;

    if (shouldUseSchema !== false && schema !== undefined) {
      this.shouldUseSchema = true;
    }

    if (shouldSanitizeTarget === true && !isSanitized) {
      target = new Sanitize({ target }, 'target');
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
    operator: FilterOperators<'WithoutDollarSign'>,
    key: string,
    value: unknown
  ) {
    const isAllowed = this.allowedOperators.includes(operator);
    if (!isAllowed) return;

    const operatorType = filteringOperatorsAsKeysWithTypesAsValues[operator];

    const operatorHandler = filteringOperatorsTypesHandlersObject[
      operatorType
    ] as FilterOperatorHandler;

    const mongoOperator = `$${operator}` as FilterOperators<'WithDollarSign'>;

    const _value = await this.convertToSchemaType(key, value);

    const filtered = operatorHandler(mongoOperator, key, _value);

    this._filtered.push(filtered as UntypedObject);
  }

  async addAllowedOperatorsFromObject(key: string, operators: object) {
    if (typeof operators !== 'object') return;

    const operatorsEntries = Object.entries(operators) as [
      FilterOperators<'WithoutDollarSign'>,
      unknown
    ][];

    for await (const [operator, operatorValue] of operatorsEntries) {
      await this.addOperatorIfAllowed(operator, key, operatorValue);
    }
  }

  private getOperatorValue(allowedTargetKey: string) {
    let operatorValue: any;

    if (this.target instanceof Sanitize) {
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
