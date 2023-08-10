import { Document as MongoDocument } from 'mongodb';
import getSchemaTypeConstructor from './utils/getSchemaTypeConstructor';

import type {
  MongoSchema,
  MongoSchemaTypesConstructors,
} from './types/MongoDBSchema';

class MongoDbSchema<T extends MongoDocument> {
  schema: {
    [key: string]: MongoSchemaTypesConstructors;
  } = {};

  constructor(schema: MongoSchema<T>) {
    Object.entries(schema).forEach(([_key, value]) => {
      const key = _key === '_typeField' ? 'type' : _key;
      this.schema[key] = new (getSchemaTypeConstructor(value))(
        key,
        value as any
      );
    });
  }

  validate(schema: UntypedObject, validationType: 'PARTIAL' | 'FULL' = 'FULL') {
    const validated: UntypedObject = {};
    const schemaEntries = Object.entries(this.schema);

    if (schemaEntries.length === 0) return validated;

    schemaEntries.forEach(([schemaNameKey, SchemaTypeClass]) => {
      const keyIsNotDefined = !(schemaNameKey in schema);
      if (keyIsNotDefined && validationType === 'PARTIAL') return;

      const { hasAssignedValue, value } = SchemaTypeClass.validateFieldValue(
        schema[schemaNameKey]
      );
      if (hasAssignedValue) validated[schemaNameKey] = value;
    });

    return validated;
  }
}

export default MongoDbSchema;
