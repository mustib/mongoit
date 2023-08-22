import getTypeof from '../../../../getTypeof';
import MongoDBSchemaValidators from '../MongoDBSchemaValidator';

import type {
  MongoSchemaTypes,
  SchemaTypeData,
  SchemaTypesConstructorsAssignOrConvertTheRightValueOptions,
  ValidatorValueObj,
} from '../types/MongoDBSchema';

abstract class AbstractMongoDbSchemaType<Type extends MongoSchemaTypes> {
  private _default = {
    hasDefault: false,
    value: undefined as any,
  };

  get default() {
    let { value } = this._default;
    const { hasDefault } = this._default;
    if (typeof value === 'function') value = value();
    return { value, hasDefault };
  }

  validatorsData!: MongoDBSchemaValidators;

  schemaFieldName!: string;

  type!: Type;

  abstract assignOrConvertTheRightValue(
    value: any,
    options?: SchemaTypesConstructorsAssignOrConvertTheRightValueOptions
  ): ValidatorValueObj;

  getDefaultValueObj() {
    const defaultValue = this.default.value;
    const valueObj: ValidatorValueObj = {
      value: typeof defaultValue === 'function' ? defaultValue() : defaultValue,
      hasAssignedValue: true,
      valueType: this.type,
    };
    return valueObj;
  }

  validateFieldValue(_value: any) {
    const { hasDefault } = this.default;
    const isUndefinedValue = _value === undefined;
    const shouldAssignDefault = isUndefinedValue && hasDefault;

    if (shouldAssignDefault) return this.getDefaultValueObj();

    const valueObj = this.assignOrConvertTheRightValue(_value);

    if (!valueObj.hasAssignedValue && hasDefault) {
      return this.getDefaultValueObj();
    }

    const valueType = getTypeof(_value);

    if (
      !valueObj.hasAssignedValue &&
      valueType !== 'undefined' &&
      valueType !== this.type
    ) {
      throw new Error(
        `Schema type error for ${this.schemaFieldName} field, ${valueType} type can not be assigned to ${this.type}`
      );
    }

    this.validatorsData.validateValidators(valueObj);

    return valueObj;
  }

  /**
   * MUST BE CALLED AT THE END OF EACH CLASS' CONSTRUCTOR.
   * didn't call it in this class' constructor because some properties will be undefined by that time.
   */
  init(type: Type, schemaData: SchemaTypeData) {
    this.type = type;
    this.schemaFieldName = schemaData.schemaFieldName;
    this.validatorsData = new MongoDBSchemaValidators(schemaData);
    this.setAndValidateDefaultValue(schemaData.schemaValue);
  }

  setAndValidateDefaultValue(schemaValue: SchemaTypeData['schemaValue']) {
    if (getTypeof(schemaValue) !== 'object' || !('default' in schemaValue))
      return;
    try {
      const defaultValue = schemaValue.default;
      const isDynamicDefault = typeof defaultValue === 'function';
      const defaultValueObj = this.assignOrConvertTheRightValue(
        isDynamicDefault ? defaultValue() : defaultValue
      );

      if (!defaultValueObj.hasAssignedValue) {
        throw new Error(
          `Provided default value for ${this.schemaFieldName} field cannot be applied`
        );
      }

      this.validatorsData.validateValidators(defaultValueObj);
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
