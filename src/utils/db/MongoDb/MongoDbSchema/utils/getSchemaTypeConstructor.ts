/* eslint-disable no-nested-ternary */
import { Document as MongoDocument } from 'mongodb';
import { MongoSchema, MongoSchemaTypes } from '../types/MongoDBSchema';
import getTypeof from '../../../../getTypeof';
import MongoDbStringSchemaType from '../MongoDbSchemaTypes/MongoDbStringSchemaType';
import MongoDbNumberSchemaType from '../MongoDbSchemaTypes/MongoDbNumberSchemaType';
import MongoDbBooleanSchemaType from '../MongoDbSchemaTypes/MongoDbBooleanSchemaType';
import MongoDbDateSchemaType from '../MongoDbSchemaTypes/MongoDbDateSchemaType';
import _MongoDbArraySchemaType = require('../MongoDbSchemaTypes/MongoDbArraySchemaType');
import _MongoDbObjectSchemaType = require('../MongoDbSchemaTypes/MongoDbObjectSchemaType');

// NOTE: using them like this to prevent dependency cycle
const MongoDbArraySchemaType = _MongoDbArraySchemaType.default;
const MongoDbObjectSchemaType = _MongoDbObjectSchemaType.default;

const schemaTypeConstructorsObject = {
  string: MongoDbStringSchemaType,
  number: MongoDbNumberSchemaType,
  bool: MongoDbBooleanSchemaType,
  date: MongoDbDateSchemaType,
  array: MongoDbArraySchemaType,
  object: MongoDbObjectSchemaType,
};

function getSchemaTypeConstructor(
  schemaKeyValue: MongoSchema<MongoDocument>[keyof MongoSchema<MongoDocument>]
) {
  const type =
    typeof schemaKeyValue === 'string'
      ? schemaKeyValue
      : typeof schemaKeyValue.type === 'string'
      ? schemaKeyValue.type
      : Array.isArray(schemaKeyValue) || Array.isArray(schemaKeyValue.type)
      ? 'array'
      : getTypeof(schemaKeyValue.type);

  if (!(type in schemaTypeConstructorsObject)) {
    throw new Error(`Schema type error, "${type}" is not a valid type`);
  }

  return schemaTypeConstructorsObject[type as MongoSchemaTypes];
}

export default getSchemaTypeConstructor;
