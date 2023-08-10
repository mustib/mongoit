import getTypeof from '../../../../getTypeof';
import arrayAndStringValidatorsData from '../config/arrayAndStringValidatorsData';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType';

import type {
  SharedSchemaTypeFields,
  StringSchemaType,
  WithShorthandSchemaType,
} from '../types/MongoDBSchema';

const validatorsData = arrayAndStringValidatorsData;

class MongoDbStringSchemaType extends AbstractMongoDbSchemaType<'string'> {
  assignOrConvertTheRightValue(_value: any) {
    let value;
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

    return { value, valueType, hasAssignedValue };
  }

  constructor(
    schemaFieldName: string,
    schemaValue: WithShorthandSchemaType<StringSchemaType> &
      SharedSchemaTypeFields<any>
  ) {
    super();
    this.init('string', {
      schemaFieldName,
      schemaValue,
      validatorsData,
    });
  }
}

export default MongoDbStringSchemaType;
