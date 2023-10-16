import AppError from '../../../../AppError/AppError.js';
import TypedEventEmitter from '../../../../TypedEventEmitter.js';
import getTypeof from '../../../../getTypeof.js';
import MongoDBSchemaValidators from '../MongoDBSchemaValidator.js';

import type {
  MongoSchemaTypes,
  SchemaTypeData,
  SchemaTypesConstructorsAssignOrConvertTheRightValueOptions,
  SchemaTypesConstructorsValidateFieldValueOptions,
  ValidatorValueObj,
} from '../types/MongoDBSchema.js';

abstract class AbstractMongoDbSchemaType<Type extends MongoSchemaTypes> {
  private _default = {
    hasDefault: false,
    value: undefined as any,
  };

  validatorsData!: MongoDBSchemaValidators;

  schemaFieldName!: string;

  type!: Type;

  eventEmitter = new TypedEventEmitter<{ init: any }>();

  initialize = (() => {
    let hasInitialized = false;
    return new Promise((resolve) => {
      if (hasInitialized) {
        resolve(true);
      }

      this.eventEmitter.once('init', () => {
        hasInitialized = true;
        resolve(true);
      });
    });
  })();

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
    { schema }: SchemaTypesConstructorsValidateFieldValueOptions
  ) {
    await this.initialize;

    const { hasDefault } = this._default;
    const isUndefinedValue = _value === undefined;
    const shouldAssignDefault = isUndefinedValue && hasDefault;

    if (shouldAssignDefault) return this.getDefaultValueObj();

    const valueObj = await this.assignOrConvertTheRightValue(_value, {
      schema,
    });

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

    await this.validatorsData.validateValidators(valueObj, schema);

    return valueObj;
  }

  /**
   * MUST BE CALLED AT THE END OF EACH CLASS' CONSTRUCTOR.
   * didn't call it in this class' constructor because some properties will be undefined by that time.
   */
  async init<T extends Type>(type: T, schemaData: SchemaTypeData<T>) {
    this.type = type;
    this.schemaFieldName = schemaData.schemaFieldName;
    this.validatorsData = new MongoDBSchemaValidators(schemaData);
    await this.setAndValidateDefaultValue(schemaData.schemaValue);

    this.eventEmitter.emit('init');
  }

  async setAndValidateDefaultValue(
    schemaValue: SchemaTypeData<Type>['schemaValue']
  ) {
    if (
      getTypeof(schemaValue) !== 'object' ||
      // NOTE: This check is only for ts to infer schemaValue as an object
      typeof schemaValue !== 'object' ||
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

      await this.validatorsData.validateValidators(defaultValueObj, {});

      this._default.value = isDynamicDefault
        ? defaultValue
        : defaultValueObj.value;

      this._default.hasDefault = true;
    } catch (error) {
      throw new Error(
        `Error while adding and validating default value for ${
          this.schemaFieldName
        } field, ${(error as any).message}`
      );
    }
  }
}

export default AbstractMongoDbSchemaType;
