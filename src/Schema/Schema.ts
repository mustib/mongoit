import { Document as MongoDocument } from 'mongodb';

import {
  AppErrorRoot,
  TypedEventEmitter,
  type UntypedObject
} from "@mustib/utils";

import { getSchemaTypeConstructor } from './utils/getSchemaTypeConstructor.js';

import type {
  MongoitSchema,
  SchemaConstructors,
  SchemaEvents,
  SchemaValidationType,
  AppErrorTypes
} from '../index.js';

/**
 * @description define a new mongoit schema structure
 */
export class Schema<T extends MongoDocument> {
  schema: {
    [key: string]: SchemaConstructors;
  } = {};

  constructor(schema: MongoitSchema<T>) {
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

    return schema as SchemaConstructors | undefined;
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
          schema,
        });

      if (hasAssignedValue) converted[key] = assignedValue;
    }

    return converted;
  }

  async validate(
    schema: UntypedObject,
    validationType: SchemaValidationType = 'FULL',
    options?: {
      eventEmitter?: SchemaEvents;
    }
  ) {
    if (validationType === 'OFF') return schema;

    const validated: UntypedObject = {};

    const schemaEntries = Object.entries(this.schema);

    if (schemaEntries.length === 0) return validated;

    const appErrorRoot = new AppErrorRoot<AppErrorTypes>();

    const eventEmitter = new TypedEventEmitter() as SchemaEvents;

    for await (const [schemaNameKey, SchemaTypeClass] of schemaEntries) {
      const keyIsNotDefined = !(schemaNameKey in schema);

      if (keyIsNotDefined && validationType === 'PARTIAL') continue;

      await appErrorRoot.tryCatch(async () => {
        const { hasAssignedValue, value } =
          await SchemaTypeClass.validateFieldValue(schema[schemaNameKey], {
            schema,
            eventEmitter,
          });

        if (hasAssignedValue) validated[schemaNameKey] = value;
      });
    }

    appErrorRoot.end(this.validate);

    eventEmitter.emit('validate', { validated });

    if (options?.eventEmitter) {
      options.eventEmitter.once('insert', () => {
        eventEmitter.emit('insert', { validated });
      });
    }

    return validated;
  }
}
