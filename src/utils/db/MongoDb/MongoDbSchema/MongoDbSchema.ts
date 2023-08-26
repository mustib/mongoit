import { Document as MongoDocument } from 'mongodb';
import getSchemaTypeConstructor from './utils/getSchemaTypeConstructor';

import type {
  MongoSchema,
  MongoSchemaTypesConstructors,
  SchemaValidationType,
} from './types/MongoDBSchema';

class MongoDbSchema<T extends MongoDocument> {
  schema: {
    [key: string]: MongoSchemaTypesConstructors;
  } = {};

  constructor(schema: MongoSchema<T>) {
    Object.entries(schema).forEach(([_key, value]) => {
      const key = _key === '_typeField' ? 'type' : _key;
      const SchemaTypeConstructor = getSchemaTypeConstructor(value);
      this.schema[key] = new SchemaTypeConstructor(key, value as any);
    });
  }

  getSchemaTypeByKey(key: string) {
    const keys = key.split('.');
    let schema: any = this.schema[keys[0]];

    for (let i = 1; i < keys.length && schema !== undefined; i++) {
      schema = schema.nestedSchema[keys[i] as never];
    }

    return schema as MongoSchemaTypesConstructors | undefined;
  }

  convertValuesToSchemaTypes(schema: UntypedObject) {
    const converted: UntypedObject = {};
    const schemaEntries = Object.entries(schema);

    if (schemaEntries.length === 0) return converted;

    schemaEntries.forEach(([key, value]) => {
      if (!(key in this.schema)) return;

      const SchemaTypeClass = this.schema[key];

      const { hasAssignedValue, value: assignedValue } =
        SchemaTypeClass.assignOrConvertTheRightValue(value, {
          onlyConvertTypeForNestedSchema: true,
        });

      if (hasAssignedValue) converted[key] = assignedValue;
    });

    return converted;
  }

  validate(
    schema: UntypedObject,
    validationType: SchemaValidationType = 'FULL'
  ) {
    if (validationType === 'OFF') return schema;

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
