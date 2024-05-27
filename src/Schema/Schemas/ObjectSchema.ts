import {
  getTypeof,
  parseJson,
  AppErrorRoot
} from '@mustib/utils';

import { getSchemaTypeConstructor } from '../utils/getSchemaTypeConstructor.js';

import { AbstractSchema } from './AbstractSchema.js';

import type {
  SchemaConstructors,
  SchemaTypesConstructorsAssignOrConvertTheRightValueOptions,
  ValidatorValueObj,
  ObjectSchemaType,
} from '../types/index.js';

export class ObjectSchema extends AbstractSchema<'object'> {
  nestedSchema: { [key: string | number]: SchemaConstructors } = {};

  constructor(schemaFieldName: string, schemaValue: ObjectSchemaType<any>) {
    super();
    this.createNestedSchema(schemaValue.type, schemaFieldName);
    this.init('object', { schemaFieldName, schemaValue, validatorsData: {} });
  }

  createNestedSchema(
    schemaValue: ObjectSchemaType<any>['type'],
    schemaFieldName: string
  ) {
    const schemaEntries = Object.entries(schemaValue);

    if (schemaEntries.length === 0) {
      throw new Error(
        `Schema type error for ${schemaFieldName} field, provided object has no fields`
      );
    }

    schemaEntries.forEach(([_schemaName, schema]) => {
      const schemaName = _schemaName === '_typeField' ? 'type' : _schemaName;
      const SchemaTypeConstructor = getSchemaTypeConstructor(schema);
      const fieldName = `${schemaFieldName}["${schemaName}"]`;

      this.nestedSchema[schemaName] = new SchemaTypeConstructor(
        fieldName,
        schema as never
      );
    });
  }

  async assignOrConvertTheRightValue(
    _value: any,
    options?: SchemaTypesConstructorsAssignOrConvertTheRightValueOptions
  ) {
    let value: UntypedObject;

    switch (getTypeof(_value)) {
      case 'string':
        {
          const v = parseJson<UntypedObject>(_value);
          if (v !== undefined) value = v;
          else value = {};
        }
        break;
      case 'object':
        value = _value;
        break;
      default:
        value = {};
    }

    const valueObj: ValidatorValueObj = {
      value: {},
      valueType: 'object',
      hasAssignedValue: false,
    };

    const nestedSchemaEntries = Object.entries(this.nestedSchema);

    if (nestedSchemaEntries.length === 0) return valueObj;

    const appErrorRoot = new AppErrorRoot();

    for await (const [schemaName, schema] of nestedSchemaEntries) {
      await appErrorRoot.tryCatch(async () => {
        let validatedFieldValue: ValidatorValueObj;

        if (options?.onlyConvertTypeForNestedSchema === true) {
          validatedFieldValue = await schema.assignOrConvertTheRightValue(
            value[schemaName],
            options
          );
        } else
          validatedFieldValue = await schema.validateFieldValue(
            value[schemaName],
            {
              eventEmitter: options?.eventEmitter,
              schema: options?.schema ?? {},
            }
          );

        if (validatedFieldValue.hasAssignedValue) {
          valueObj.value[schemaName] = validatedFieldValue.value;
          valueObj.hasAssignedValue = true;
        }
      });
    }

    appErrorRoot.end();

    return valueObj;
  }
}
