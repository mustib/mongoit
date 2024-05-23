/* eslint-disable no-nested-ternary */
import { Document as MongoDocument } from 'mongodb';
import { getTypeof } from '@mustib/utils';
import { MongoSchema, MongoSchemaTypes } from '../types/MongoDBSchema.js';
import MongoDbStringSchemaType from '../MongoDbSchemaTypes/MongoDbStringSchemaType.js';
import MongoDbNumberSchemaType from '../MongoDbSchemaTypes/MongoDbNumberSchemaType.js';
import MongoDbBooleanSchemaType from '../MongoDbSchemaTypes/MongoDbBooleanSchemaType.js';
import MongoDbDateSchemaType from '../MongoDbSchemaTypes/MongoDbDateSchemaType.js';
import MongoDbFileSchemaType from '../MongoDbSchemaTypes/MongoDbFileSchemaType.js';
import MongoDbArraySchemaType from '../MongoDbSchemaTypes/MongoDbArraySchemaType.js';
import MongoDbObjectSchemaType from '../MongoDbSchemaTypes/MongoDbObjectSchemaType.js';
import MongoDbIdSchemaType from '../MongoDbSchemaTypes/MongoDbIdSchemaType.js';

const schemaTypeConstructorsObject = {
  string: MongoDbStringSchemaType,
  number: MongoDbNumberSchemaType,
  bool: MongoDbBooleanSchemaType,
  date: MongoDbDateSchemaType,
  array: MongoDbArraySchemaType,
  object: MongoDbObjectSchemaType,
  id: MongoDbIdSchemaType,
  image: MongoDbFileSchemaType,
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
