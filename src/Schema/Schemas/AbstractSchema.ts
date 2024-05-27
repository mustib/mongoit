import {
  getTypeof,
  AppError,
  TypedEventEmitter
} from '@mustib/utils';

import { Validator } from '../Validator.js';

import { isObject } from '../../utils/isObject.js';

import type {
  MongoitSchemaTypes,
  SchemaTypeData,
  SchemaTypesConstructorsAssignOrConvertTheRightValueOptions,
  SchemaTypesConstructorsValidateFieldValueOptions,
  ValidatorValueObj,
} from '../types/index.js';


export abstract class AbstractSchema<Type extends MongoitSchemaTypes> {
  private _default = {
    hasDefault: false,
    value: undefined as any,
  };

  // will be assigned by init() method
  declare validator: Validator;

  // will be assigned by init() method
  declare schemaFieldName: string;

  // will be assigned by init() method
  declare type: Type;

  eventEmitter = new TypedEventEmitter<{ init: any }>();

  private initialize = (() => new Promise<void>((resolve) => {
    this.eventEmitter.once('init', resolve);
  }))();

  abstract assignOrConvertTheRightValue(
    value: any,
    options?: SchemaTypesConstructorsAssignOrConvertTheRightValueOptions
  ): ValidatorValueObj | Promise<ValidatorValueObj>;

  async getDefaultValueObj() {
    const defaultValue = this._default.value;

    const valueObj: ValidatorValueObj = {
      value:
        typeof defaultValue === 'function'
          ? await defaultValue()
          : defaultValue,
      hasAssignedValue: true,
      valueType: this.type,
    };

    return valueObj;
  }

  async validateFieldValue(
    _value: any,
    options: SchemaTypesConstructorsValidateFieldValueOptions
  ) {
    await this.initialize;

    const { hasDefault } = this._default;
    const isUndefinedValue = _value === undefined;
    const shouldAssignDefault = isUndefinedValue && hasDefault;

    if (shouldAssignDefault) return this.getDefaultValueObj();

    const valueObj = await this.assignOrConvertTheRightValue(_value, options);

    if (!valueObj.hasAssignedValue && hasDefault) {
      return this.getDefaultValueObj();
    }

    const valueType = getTypeof(_value);

    if (
      !valueObj.hasAssignedValue &&
      valueType !== 'undefined' &&
      valueType !== this.type
    ) {
      AppError.throw(
        'Type',
        `${valueType} type can not be assigned to ${this.type} in ${this.schemaFieldName} field`
      );
    }

    await this.validator.validateValidators(valueObj, options.schema);

    return valueObj;
  }

  /*
   * NOTE: Acts like a constructor and MUST BE CALLED AT THE END OF EACH CLASS' CONSTRUCTOR.
   * because some schemas will have to do some work before calling super(), and super has to be called first,
   * this method will help delegate constructor work at the end
   */
  protected async init(type: Type, schemaData: SchemaTypeData<Type>) {
    this.type = type;
    this.schemaFieldName = schemaData.schemaFieldName;
    this.validator = new Validator(schemaData);
    await this.setAndValidateDefaultValue(schemaData.schemaValue);

    this.eventEmitter.emit('init');
  }

  private async setAndValidateDefaultValue(
    schemaValue: SchemaTypeData<Type>['schemaValue']
  ) {
    if (
      !isObject(schemaValue) ||
      !('default' in schemaValue)
    )
      return;

    try {
      const defaultValue = schemaValue.default;
      const isDynamicDefault = typeof defaultValue === 'function';

      const defaultValueObj = await this.assignOrConvertTheRightValue(
        isDynamicDefault ? await defaultValue() : defaultValue
      );

      if (!defaultValueObj.hasAssignedValue) {
        throw new Error(
          `Provided default value for ${this.schemaFieldName} field cannot be applied`
        );
      }

      await this.validator.validateValidators(defaultValueObj, {});

      this._default.value = isDynamicDefault
        ? defaultValue
        : defaultValueObj.value;

      this._default.hasDefault = true;
    } catch (error) {
      throw new Error(
        `Error while adding and validating default value for ${this.schemaFieldName
        } field, ${(error as any).message}`
      );
    }
  }
}
