import getTypeof from '../../../getTypeof';

import type {
  StringSchemaType,
  NumberSchemaType,
  BooleanSchemaType,
  DateSchemaType,
  ArraySchemaType,
  ObjectSchemaType,
  SchemaTypeValidatorsData,
  SchemaTypeValidators,
  SharedSchemaTypeFields,
  ValidatorWithOptionalErrorMessage,
  WithShorthandSchemaType,
  SchemaTypeData,
  ValidatorValueObj,
  ValidatorObjectWithOptionalErrorMessage,
} from './types/MongoDBSchema';

type ValidatorArray = [
  string,
  ReturnType<
    (typeof MongoDBSchemaValidators)['createValidatorObjectAndCheckItsType']
  >
];

class MongoDBSchemaValidators {
  schemaFieldName: string;

  requiredValidator: ValidatorArray['1'] | { value: boolean } = {
    value: false,
  };

  validators: ValidatorArray[] = [];

  static requiredValidatorData: SchemaTypeValidatorsData = {
    type: 'boolean',
    defaultErrorMessage(_, _2, field) {
      return `${field} is a required field and it is not defined`;
    },
    validator(value, validatorValue) {
      return value === validatorValue;
    },
  };

  static customValidatorData: SchemaTypeValidatorsData = {
    type: 'function',
    defaultErrorMessage(value, validatorValue, field) {
      return `custom validation for ${field} field failed`;
    },
    validator(value, validatorValue: (value: any) => boolean) {
      return validatorValue(value);
    },
  };

  static checkValidatorValueType(
    validatorValue: string,
    validatorType: string
  ) {
    const typeofValue = getTypeof(validatorValue);
    if (typeofValue !== validatorType) {
      throw new Error(
        `Error while creating schema validator value, ${validatorValue} as ${typeofValue} value is not a valid ${validatorType}`
      );
    }
  }

  static createValidatorObjectAndCheckItsType(
    validatorValue: ValidatorWithOptionalErrorMessage<any>,
    validatorData: SchemaTypeValidatorsData
  ) {
    let value;
    let message;

    if (typeof validatorValue !== 'object') value = validatorValue;
    else if (Array.isArray(validatorValue)) [value, message] = validatorValue;
    else if (typeof validatorValue === 'object') {
      value = validatorValue.value;
      message = validatorValue.message;
    }

    MongoDBSchemaValidators.checkValidatorValueType(value, validatorData.type);

    if (message === undefined) message = validatorData.defaultErrorMessage;

    const { type, validator } = validatorData;

    return {
      validate: validator,
      message: message as Required<
        ValidatorObjectWithOptionalErrorMessage<any>
      >['message'],
      type,
      value,
    };
  }

  constructor(schemaData: SchemaTypeData) {
    const { schemaFieldName, schemaValue, validatorsData } = schemaData;
    this.schemaFieldName = schemaFieldName;
    this.createValidators(validatorsData, schemaValue);
  }

  validateValidator(value: any, validatorObj: ValidatorArray['1']) {
    const validatorValue = validatorObj.value;
    const isValid = validatorObj.validate(value, validatorValue);

    if (isValid) return;

    let errorMessage = '';

    if (typeof validatorObj.message === 'function') {
      const isDefaultErrorMessage =
        validatorObj.message.name === 'defaultErrorMessage';
      const _errorMessage = validatorObj.message(
        value,
        validatorValue,
        this.schemaFieldName
      );

      errorMessage = `${
        isDefaultErrorMessage
          ? `Schema validation error for ${this.schemaFieldName} field, `
          : ''
      }${_errorMessage}`;
    } else errorMessage = validatorObj.message;

    throw new Error(errorMessage);
  }

  validateValidators(valueObj: ValidatorValueObj) {
    if (this.requiredValidator.value === true) {
      this.validateValidator(
        valueObj.hasAssignedValue,
        this.requiredValidator as ValidatorArray['1']
      );
    }

    if (!valueObj.hasAssignedValue) return;

    for (let i = 0; i < this.validators.length; i++) {
      this.validateValidator(valueObj.value, this.validators[i][1]);
    }
  }

  createValidators(
    validatorsData: SchemaTypeValidators,
    schemaValue: (
      | WithShorthandSchemaType<
          | StringSchemaType
          | NumberSchemaType
          | BooleanSchemaType
          | DateSchemaType
          | ArraySchemaType<any>
        >
      | ObjectSchemaType<any>
    ) &
      SharedSchemaTypeFields<any>
  ) {
    if (getTypeof(schemaValue) !== 'object') return;

    if ('required' in schemaValue) {
      const requiredValidatorData =
        MongoDBSchemaValidators.createValidatorObjectAndCheckItsType(
          schemaValue.required,
          MongoDBSchemaValidators.requiredValidatorData
        );

      if (requiredValidatorData.value === true) {
        this.requiredValidator = requiredValidatorData;
      }
    }

    const validatorsDataEntries = Object.entries(validatorsData);

    if ('validator' in schemaValue) {
      validatorsDataEntries.push([
        'validator',
        MongoDBSchemaValidators.customValidatorData,
      ]);
    }

    validatorsDataEntries.forEach(([validatorName, validatorData]) => {
      if (!(validatorName in schemaValue)) return;

      const _validatorData =
        MongoDBSchemaValidators.createValidatorObjectAndCheckItsType(
          schemaValue[validatorName as keyof typeof schemaValue],
          validatorData
        );

      this.validators.push([validatorName, _validatorData]);
    });
  }
}

export default MongoDBSchemaValidators;
