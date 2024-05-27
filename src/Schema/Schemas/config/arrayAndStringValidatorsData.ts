import { ArrayAndStringSchemaTypeValidatorsData } from '../../types/index.js';

const maxLength: ArrayAndStringSchemaTypeValidatorsData['maxLength'] = {
  type: 'number',
  validator(value, validatorValue) {
    return value.length <= validatorValue;
  },
  defaultErrorMessage(value, validatorValue, field) {
    return `maximum length for ${field} field is ${validatorValue}, but instead got ${value.length} with value of "${value}"`;
  },
};

const minLength: ArrayAndStringSchemaTypeValidatorsData['minLength'] = {
  type: 'number',
  defaultErrorMessage(value, validatorValue, field) {
    return `minimum length for ${field} field is ${validatorValue}, but instead got ${value.length} with value of "${value}"`;
  },
  validator(value, validatorValue) {
    return value.length >= validatorValue;
  },
};

const arrayAndStringValidatorsData: ArrayAndStringSchemaTypeValidatorsData = {
  maxLength,
  minLength,
};

export default arrayAndStringValidatorsData;
