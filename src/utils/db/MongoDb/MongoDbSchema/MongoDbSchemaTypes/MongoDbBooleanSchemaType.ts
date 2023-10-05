import getTypeof from '../../../../getTypeof.js';
import arrayAndStringValidatorsData from '../config/arrayAndStringValidatorsData.js';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType.js';

import type {
  SharedSchemaTypeFields,
  BooleanSchemaType,
  WithShorthandSchemaType,
} from '../types/MongoDBSchema.js';

const validatorsData = arrayAndStringValidatorsData;

class MongoDbBooleanSchemaType extends AbstractMongoDbSchemaType<'bool'> {
  assignOrConvertTheRightValue(_value: any) {
    let value;
    const valueType: ReturnType<typeof getTypeof> = getTypeof(_value);
    let hasAssignedValue = false;

    if (valueType === 'boolean') {
      value = _value;
      hasAssignedValue = true;
    }

    return { value, valueType, hasAssignedValue };
  }

  constructor(
    schemaFieldName: string,
    schemaValue: WithShorthandSchemaType<BooleanSchemaType> &
      SharedSchemaTypeFields<any>
  ) {
    super();
    this.init('bool', {
      schemaFieldName,
      schemaValue,
      validatorsData,
    });
  }
}

export default MongoDbBooleanSchemaType;
