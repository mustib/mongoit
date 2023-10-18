import getTypeof from '../../../getTypeof.js';
import AppError from '../../../AppError/AppError.js';
import AppErrorRoot from '../../../AppError/AppErrorRoot.js';

import type {
  SchemaTypeValidatorsData,
  SchemaTypeData,
  ValidatorValueObj,
  SharedSchemaTypeValidatorsData,
  ValidatorObjectWithOptionalErrorMessage,
  TypeofSchemaValidators,
  ValueofSchemaValidators,
  ValidatorArrayWithOptionalErrorMessage,
  MongoSchemaTypes,
  ValidatorMetaObject,
} from './types/MongoDBSchema.js';

type ValidatorArray = [
  string,
  ReturnType<
    (typeof MongoDBSchemaValidators)['createValidatorObjectAndCheckItsType']
  >
];

type ValidatorValue =
  | ValueofSchemaValidators
  | ValidatorArrayWithOptionalErrorMessage<
      UntypedObject,
      any,
      ValueofSchemaValidators
    >
  | ValidatorObjectWithOptionalErrorMessage<
      UntypedObject,
      any,
      ValueofSchemaValidators
    >;

const sharedValidatorsData: SharedSchemaTypeValidatorsData = {
  requiredValidator: {
    type: 'boolean',
    defaultErrorMessage(_, _2, { field }) {
      return `${field} is a required field and it is not defined`;
    },

    validator(value, validatorValue) {
      return value === validatorValue;
    },
  },
  customValidator: {
    type: 'function',
    defaultErrorMessage(value, validatorValue, { field }) {
      return `custom validation for ${field} field failed`;
    },

    validator(value, validatorValue, meta) {
      return validatorValue(value, meta);
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
    validatorValue: ValueofSchemaValidators,
    validatorType: TypeofSchemaValidators
  ) {
    const typeofValue = getTypeof(validatorValue);
    if (typeofValue !== validatorType) {
      throw new Error(
        `Error while creating schema validator value, ${validatorValue} as ${typeofValue} value is not a valid ${validatorType}`
      );
    }
  }

  static createValidatorObjectAndCheckItsType(
    validatorValue: ValidatorValue,
    validatorData: SchemaTypeValidatorsData<
      TypeofSchemaValidators,
      any,
      ValueofSchemaValidators
    >
  ) {
    let value: any;
    let message;

    if (typeof validatorValue !== 'object') value = validatorValue;
    else if (Array.isArray(validatorValue)) [value, message] = validatorValue;
    else {
      value = validatorValue.value;
      message = validatorValue.message;
    }

    MongoDBSchemaValidators.checkValidatorValueType(value, validatorData.type);

    if (message === undefined) message = validatorData.defaultErrorMessage;

    const { type, validator } = validatorData;

    return {
      validate: validator,
      message: message as
        | string
        | Required<
            ValidatorObjectWithOptionalErrorMessage<any, any, any>
          >['message'],
      type,
      value: value as ValueofSchemaValidators,
    };
  }

  constructor(schemaData: SchemaTypeData<any>) {
    const { schemaFieldName, schemaValue, validatorsData } = schemaData;
    this.schemaFieldName = schemaFieldName;
    this.createValidators(validatorsData, schemaValue);
  }

  async validateValidator(
    value: any,
    schema: UntypedObject,
    validatorObj: ValidatorArray['1']
  ) {
    const validatorValue = validatorObj.value;

    const meta: ValidatorMetaObject = {
      fieldName: this.schemaFieldName,
      schema,
    };

    const isValid = await validatorObj.validate(value, validatorValue, meta);

    if (isValid) return;

    let errorMessage = '';

    if (typeof validatorObj.message === 'function') {
      errorMessage = validatorObj.message(value, validatorValue, meta);
    } else errorMessage = validatorObj.message;

    AppError.throw('Validation', errorMessage);
  }

  async validateValidators(valueObj: ValidatorValueObj, schema: UntypedObject) {
    const appErrorRoot = new AppErrorRoot();

    if (this.requiredValidator.value === true) {
      await appErrorRoot.tryCatch(async () => {
        await this.validateValidator(
          valueObj.hasAssignedValue,
          schema,
          this.requiredValidator as ValidatorArray['1']
        );
      });
    }

    if (valueObj.hasAssignedValue) {
      for await (const validator of this.validators) {
        await appErrorRoot.tryCatch(async () => {
          await this.validateValidator(valueObj.value, schema, validator[1]);
        });
      }
    }

    appErrorRoot.end(this.validateValidators);
  }

  createValidators(
    validatorsData: Record<string, SchemaTypeValidatorsData<any, any, any>>,
    schemaValue: SchemaTypeData<MongoSchemaTypes>['schemaValue']
  ) {
    if (getTypeof(schemaValue) !== 'object' || typeof schemaValue !== 'object')
      return;

    if ('required' in schemaValue) {
      const requiredValidatorData =
        MongoDBSchemaValidators.createValidatorObjectAndCheckItsType(
          schemaValue.required as ValidatorValue,
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
