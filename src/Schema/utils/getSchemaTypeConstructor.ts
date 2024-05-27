/* eslint-disable no-nested-ternary */
import { Document as MongoDocument } from 'mongodb';

import { getTypeof } from '@mustib/utils';

import {
  StringSchema,
  NumberSchema,
  BooleanSchema,
  DateSchema,
  FileSchema,
  ArraySchema,
  ObjectSchema,
  IdSchema,
} from '../Schemas/index.js';

import type { MongoitSchema, MongoitSchemaTypes } from '../../types/index.js';

const schemaTypeConstructorsObject = {
  string: StringSchema,
  number: NumberSchema,
  bool: BooleanSchema,
  date: DateSchema,
  array: ArraySchema,
  object: ObjectSchema,
  id: IdSchema,
  image: FileSchema,
};

export function getSchemaTypeConstructor(
  schemaKeyValue: MongoitSchema<MongoDocument>[keyof MongoitSchema<MongoDocument>]
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

  return schemaTypeConstructorsObject[type as MongoitSchemaTypes];
}
