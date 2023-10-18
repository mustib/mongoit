import { isRegExp } from 'util/types';
import { ObjectId } from 'mongodb';
import getTypeof from '../../../../getTypeof.js';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType.js';

import type { IdSchemaType } from '../types/MongoDBSchema.js';

function defaultValue() {
  return new ObjectId();
}

class MongoDbIdSchemaType extends AbstractMongoDbSchemaType<'id'> {
  async assignOrConvertTheRightValue(_value: any) {
    const value = _value;
    const valueType = getTypeof(_value);
    let hasAssignedValue = false;

    if (value !== undefined && !Array.isArray(value) && !isRegExp(value))
      hasAssignedValue = true;

    return { value, valueType, hasAssignedValue };
  }

  constructor(schemaFieldName: string, _schemaValue: IdSchemaType) {
    super();
    const schemaValue: IdSchemaType<false> = {
      type: 'id',
    };

    if (
      typeof _schemaValue === 'string' ||
      typeof _schemaValue?.default !== 'function'
    ) {
      schemaValue.default = defaultValue;
    } else schemaValue.default = _schemaValue.default;

    this.init('id', {
      schemaFieldName,
      schemaValue,
      validatorsData: {},
    });
  }
}

export default MongoDbIdSchemaType;
