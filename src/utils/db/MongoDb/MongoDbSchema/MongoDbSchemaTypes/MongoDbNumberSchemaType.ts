import getTypeof from '../../../../getTypeof.js';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType.js';

import type {
  NumberSchemaType,
  SchemaTypeValidators,
  SharedSchemaTypeFields,
  WithShorthandSchemaType,
} from '../types/MongoDBSchema.js';

const validatorsData: SchemaTypeValidators<'number'> = {
  max: {
    type: 'number',
    validator(value: number, validatorValue: number) {
      return value <= validatorValue;
    },
    defaultErrorMessage(value, validatorValue, field) {
      return `maximum number for ${field} field is ${validatorValue}, but instead got ${value}`;
    },
  },
  min: {
    type: 'number',
    validator(value: number, validatorValue: number) {
      return value >= validatorValue;
    },
    defaultErrorMessage(value, validatorValue, field) {
      return `minimum number for ${field} field is ${validatorValue}, but instead got ${value}`;
    },
  },
};

class MongoDbNumberSchemaType extends AbstractMongoDbSchemaType<'number'> {
  constructor(
    schemaFieldName: string,
    schemaValue: WithShorthandSchemaType<NumberSchemaType> &
      SharedSchemaTypeFields<any>
  ) {
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

export default MongoDbNumberSchemaType;
