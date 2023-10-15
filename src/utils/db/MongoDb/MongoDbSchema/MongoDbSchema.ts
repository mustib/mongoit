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

  async convertValueToSchemaTypeByKey(key: string, value: any) {
    const schema = this.getSchemaTypeByKey(key);

    if (schema === undefined) return value;

    if (Array.isArray(value) && schema.type !== 'array') {
      const _value = [] as any[];

      for await (const v of value) {
        const { hasAssignedValue, value: _value2 } =
          await schema.assignOrConvertTheRightValue(v, {
            onlyConvertTypeForNestedSchema: true,
          });

        if (hasAssignedValue) _value.push(_value2);
      }

      return _value;
    }

    const { value: _value } = await schema.assignOrConvertTheRightValue(value, {
      onlyConvertTypeForNestedSchema: true,
    });

    return _value;
  }

  async convertValuesToSchemaTypes(schema: UntypedObject) {
    const converted: UntypedObject = {};
    const schemaEntries = Object.entries(schema);

    if (schemaEntries.length === 0) return converted;

    for await (const [key, value] of schemaEntries) {
      if (!(key in this.schema)) continue;

      const SchemaTypeClass = this.schema[key];

      const { hasAssignedValue, value: assignedValue } =
        await SchemaTypeClass.assignOrConvertTheRightValue(value, {
          onlyConvertTypeForNestedSchema: true,
        });

      if (hasAssignedValue) converted[key] = assignedValue;
    }

    return converted;
  }

  async validate(
    schema: UntypedObject,
    validationType: SchemaValidationType = 'FULL'
  ) {
    if (validationType === 'OFF') return schema;

    const validated: UntypedObject = {};

    const schemaEntries = Object.entries(this.schema);

    if (schemaEntries.length === 0) return validated;

    const appErrorRoot = new AppErrorRoot();

    for await (const [schemaNameKey, SchemaTypeClass] of schemaEntries) {
      const keyIsNotDefined = !(schemaNameKey in schema);

      if (keyIsNotDefined && validationType === 'PARTIAL') continue;

      await appErrorRoot.tryCatch(async () => {
        const { hasAssignedValue, value } =
          await SchemaTypeClass.validateFieldValue(schema[schemaNameKey]);

        if (hasAssignedValue) validated[schemaNameKey] = value;
      });
    }

    appErrorRoot.end(this.validate);

    return validated;
  }
}

export default MongoDbSchema;
