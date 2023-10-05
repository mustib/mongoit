import { SchemaTypeValidators } from '../types/MongoDBSchema.js';

const maxLength: SchemaTypeValidators<'string' | 'array'>['maxLength'] = {
  type: 'number',
  validator(value: { length: number }, validatorValue: number) {
    return value.length <= validatorValue;
  },
  defaultErrorMessage(value, validatorValue, field) {
    return `maximum length for ${field} field is ${validatorValue}, but instead got ${value.length} with value of "${value}"`;
  },
};

const minLength: SchemaTypeValidators<'string' | 'array'>['minLength'] = {
  type: 'number',
  defaultErrorMessage(value, validatorValue, field) {
    return `minimum length for ${field} field is ${validatorValue}, but instead got ${value.length} with value of "${value}"`;
  },
  validator(value: { length: number }, validatorValue: number) {
    return value.length >= validatorValue;
  },
};

const arrayAndStringValidatorsData: Omit<
  SchemaTypeValidators<'string' | 'array'>,
  'length' | 'caseType'
> = {
  maxLength,
  minLength,
};

export default arrayAndStringValidatorsData;
