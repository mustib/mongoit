import { getTypeof } from '@mustib/utils';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType.js';

import type { BooleanSchemaType } from '../types/MongoDBSchema.js';

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

  constructor(schemaFieldName: string, schemaValue: BooleanSchemaType) {
    super();
    this.init('bool', {
      schemaFieldName,
      schemaValue,
      validatorsData: {},
    });
  }
}

export default MongoDbBooleanSchemaType;
