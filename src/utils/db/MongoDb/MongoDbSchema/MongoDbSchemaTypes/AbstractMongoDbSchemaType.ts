import getTypeof from '../../../../getTypeof';
import MongoDBSchemaValidators from '../MongoDBSchemaValidator';

import type {
  MongoSchemaTypes,
  SchemaTypeData,
  ValidatorValueObj,
} from '../types/MongoDBSchema';

abstract class AbstractMongoDbSchemaType<Type extends MongoSchemaTypes> {
  default = {
    hasDefault: false,
    value: undefined as any,
  };

  validatorsData!: MongoDBSchemaValidators;

  schemaFieldName!: string;

  type!: Type;

  abstract assignOrConvertTheRightValue(value: any): ValidatorValueObj;

  getDefaultValueObj() {
    const defaultValue = this.default.value;
    const valueObj: ValidatorValueObj = {
      value: defaultValue,
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
      const defaultValueObj = this.assignOrConvertTheRightValue(defaultValue);

      if (!defaultValueObj.hasAssignedValue) {
        throw new Error(
          `Provided default value for ${this.schemaFieldName} field cannot be applied`
        );
      }

      this.validatorsData.validateValidators(defaultValueObj);
      this.default.value = defaultValueObj.value;
      this.default.hasDefault = true;
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
