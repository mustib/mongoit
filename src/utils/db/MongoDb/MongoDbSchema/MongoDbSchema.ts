import { Document as MongoDocument } from 'mongodb';
import AppErrorRoot from '../../../AppError/AppErrorRoot.js';
import getSchemaTypeConstructor from './utils/getSchemaTypeConstructor.js';

import type {
  MongoSchema,
  MongoSchemaTypesConstructors,
  SchemaValidationType,
} from './types/MongoDBSchema.js';

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

  convertValueToSchemaTypeByKey(key: string, value: any) {
    const schema = this.getSchemaTypeByKey(key);

    if (schema === undefined) return value;

    if (Array.isArray(value) && schema.type !== 'array') {
      const _value = value.map((v: unknown) => {
        const { hasAssignedValue, value: _value2 } =
          schema.assignOrConvertTheRightValue(v, {
            onlyConvertTypeForNestedSchema: true,
          });

        return hasAssignedValue ? _value2 : value;
      });

      return _value;
    }

    const { hasAssignedValue, value: _value } =
      schema.assignOrConvertTheRightValue(value, {
        onlyConvertTypeForNestedSchema: true,
      });
    return hasAssignedValue ? _value : value;
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

    AppErrorRoot.aggregate((tryCatch) => {
      schemaEntries.forEach(([schemaNameKey, SchemaTypeClass]) => {
        const keyIsNotDefined = !(schemaNameKey in schema);

        if (keyIsNotDefined && validationType === 'PARTIAL') return;

        tryCatch(() => {
          const { hasAssignedValue, value } =
            SchemaTypeClass.validateFieldValue(schema[schemaNameKey]);
          if (hasAssignedValue) validated[schemaNameKey] = value;
        });
      });
    });

    return validated;
  }
}

export default MongoDbSchema;
