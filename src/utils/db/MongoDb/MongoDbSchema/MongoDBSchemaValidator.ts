import getTypeof from '../../../getTypeof.js';
import AppError from '../../../AppError/AppError.js';
import AppErrorRoot from '../../../AppError/AppErrorRoot.js';

import type {
  SchemaTypeValidatorsData,
  SchemaTypeData,
  ValidatorValueObj,
  SharedSchemaTypeValidatorsData,
} from './types/MongoDBSchema.js';

type ValidatorArray = [
  string,
  ReturnType<
    (typeof MongoDBSchemaValidators)['createValidatorObjectAndCheckItsType']
  >
];

const sharedValidatorsData: SharedSchemaTypeValidatorsData = {
  requiredValidator: {
    type: 'boolean',
    defaultErrorMessage(_, _2, field) {
      return `${field} is a required field and it is not defined`;
    },
    validator(value, validatorValue) {
      return value === validatorValue;
    },
  },
  customValidator: {
    type: 'function',
    defaultErrorMessage(value, validatorValue, field) {
      return `custom validation for ${field} field failed`;
    },
    validator(value, validatorValue: (value: any) => boolean) {
      return validatorValue(value);
    },
  },
};

class MongoDBSchemaValidators {
  schemaFieldName: string;

  requiredValidator: ValidatorArray['1'] | { value: boolean } = {
    value: false,
  };

  validators: ValidatorArray[] = [];

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
    validatorValue: any,
    validatorData: SchemaTypeValidatorsData<any, any, any>
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
      message,
      type,
      value,
    };
  }

  constructor(schemaData: SchemaTypeData<any>) {
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
      errorMessage = validatorObj.message(
        value,
        validatorValue,
        this.schemaFieldName
      );
    } else errorMessage = validatorObj.message;

    AppError.throw('Validation', errorMessage);
  }

  validateValidators(valueObj: ValidatorValueObj) {
    AppErrorRoot.aggregate((tryCatch) => {
      if (this.requiredValidator.value === true) {
        tryCatch(() => {
          this.validateValidator(
            valueObj.hasAssignedValue,
            this.requiredValidator as ValidatorArray['1']
          );
        });
      }

      if (!valueObj.hasAssignedValue) return;

      for (let i = 0; i < this.validators.length; i++) {
        tryCatch(() => {
          this.validateValidator(valueObj.value, this.validators[i][1]);
        });
      }
    });
  }

  createValidators(
    validatorsData: Record<string, SchemaTypeValidatorsData<any, any, any>>,
    schemaValue: SchemaTypeData<any>['schemaValue']
  ) {
    if (getTypeof(schemaValue) !== 'object' || typeof schemaValue !== 'object')
      return;

    if ('required' in schemaValue) {
      const requiredValidatorData =
        MongoDBSchemaValidators.createValidatorObjectAndCheckItsType(
          schemaValue.required,
          sharedValidatorsData.requiredValidator
        );

      if (requiredValidatorData.value === true) {
        this.requiredValidator = requiredValidatorData;
      }
    }

    const validatorsDataEntries = Object.entries(validatorsData);

    if ('validator' in schemaValue) {
      validatorsDataEntries.push([
        'validator',
        sharedValidatorsData.customValidator,
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
