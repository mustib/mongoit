import getTypeof from '../../../../getTypeof.js';
import capitalize from '../../../../capitalize.js';
import arrayAndStringValidatorsData from '../config/arrayAndStringValidatorsData.js';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType.js';

import type {
  StringSchemaTypeValidatorsData,
  StringSchemaType,
} from '../types/MongoDBSchema.js';

const validatorsData: StringSchemaTypeValidatorsData =
  arrayAndStringValidatorsData;

class MongoDbStringSchemaType extends AbstractMongoDbSchemaType<'string'> {
  caseType: StringSchemaType<false>['caseType'];

  assignOrConvertTheRightValue(_value: any) {
    let value!: string;
    let valueType = getTypeof(_value);
    let hasAssignedValue = false;

    if (valueType === 'string') {
      value = _value;
      hasAssignedValue = true;
    } else if (valueType === 'number') {
      value = _value.toString();
      hasAssignedValue = true;
      valueType = 'string';
    }

    if (this.caseType !== undefined && hasAssignedValue) {
      const { caseType } = this;

      if (typeof caseType === 'function') {
        value = caseType(value);
      } else
        switch (caseType) {
          case 'lowerCase':
            value = value.toLowerCase();
            break;
          case 'upperCase':
            value = value.toUpperCase();
            break;
          case 'capitalize':
            value = capitalize(value);
            break;
          default:
            throw new Error('Unsupported string transform option');
        }
    }

    return { value, valueType, hasAssignedValue };
  }

  constructor(schemaFieldName: string, schemaValue: StringSchemaType) {
    super();
    if (typeof schemaValue === 'object') this.caseType = schemaValue.caseType;
    this.init('string', {
      schemaFieldName,
      schemaValue,
      validatorsData,
    });
  }
}

export default MongoDbStringSchemaType;
