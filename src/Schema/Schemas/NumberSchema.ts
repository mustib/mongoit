import { getTypeof } from '@mustib/utils';

import { AbstractSchema } from './AbstractSchema.js';

import type {
  NumberSchemaType,
  NumberSchemaTypeValidatorsData,
} from '../../index.js';

const validatorsData: NumberSchemaTypeValidatorsData = {
  max: {
    type: 'number',
    validator(value: number, validatorValue: number) {
      return value <= validatorValue;
    },
    defaultErrorMessage(value, validatorValue, { fieldName }) {
      return `maximum number for ${fieldName} field is ${validatorValue}, but instead got ${value}`;
    },
  },
  min: {
    type: 'number',
    validator(value: number, validatorValue: number) {
      return value >= validatorValue;
    },
    defaultErrorMessage(value, validatorValue, { fieldName }) {
      return `minimum number for ${fieldName} field is ${validatorValue}, but instead got ${value}`;
    },
  },
};

export class NumberSchema extends AbstractSchema<'number'> {
  constructor(schemaFieldName: string, schemaValue: NumberSchemaType) {
    super();
    this.init('number', { schemaFieldName, schemaValue, validatorsData });
  }

  assignOrConvertTheRightValue(_value: any) {
    let value;
    let valueType = getTypeof(_value);
    let hasAssignedValue = false;

    if (valueType === 'number') {
      value = _value;
      hasAssignedValue = true;
    } else if (valueType === 'string') {
      const stringValueToNumber = +_value;
      const possibleNumber = getTypeof(stringValueToNumber);

      if (possibleNumber === 'number') {
        value = stringValueToNumber;
        hasAssignedValue = true;
        valueType = 'number';
      }
    }

    return { value, valueType, hasAssignedValue };
  }
}
