import getTypeof from '../../../../getTypeof';
import arrayAndStringValidatorsData from '../config/arrayAndStringValidatorsData';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType';

import type {
  SharedSchemaTypeFields,
  BooleanSchemaType,
  WithShorthandSchemaType,
} from '../types/MongoDBSchema';

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
