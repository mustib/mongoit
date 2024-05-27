import {
  getTypeof,
  parseJson,
  AppErrorRoot
} from '@mustib/utils';


import { getSchemaTypeConstructor } from '../utils/getSchemaTypeConstructor.js';

import arrayAndStringValidatorsData from './config/arrayAndStringValidatorsData.js';

import { AbstractSchema } from './AbstractSchema.js';

import type {
  SchemaConstructors,
  ValidatorValueObj,
  SchemaTypesConstructorsAssignOrConvertTheRightValueOptions,
  ArraySchemaType,
  ArraySchemaTypeValidatorsData,
} from '../types/index.js';

const validatorsData: ArraySchemaTypeValidatorsData = {
  ...arrayAndStringValidatorsData,
  length: {
    type: 'number',
    validator(value: any[], validatorValue) {
      return value.length === validatorValue;
    },
    defaultErrorMessage(value: any[], validatorValue, field) {
      return `${field} field length must only be ${validatorValue}, but instead got ${value.length}`;
    },
  },
};

export class ArraySchema extends AbstractSchema<'array'> {
  nestedSchema: SchemaConstructors[] = [];

  length = {
    hasLength: false,
    value: 0,
  };

  constructor(schemaFieldName: string, schemaValue: ArraySchemaType<any[]>) {
    super();

    if (
      getTypeof(schemaValue) === 'object' &&
      typeof schemaValue.length === 'number'
    ) {
      this.length.hasLength = true;
      this.length.value = schemaValue.length;
    }

    this.createNestedSchema(schemaValue, schemaFieldName);

    this.init('array', { schemaFieldName, schemaValue, validatorsData });
  }

  createNestedSchema(
    schemaValue: ArraySchemaType<any[]>,
    schemaFieldName: string
  ) {
    const schema = Array.isArray(schemaValue) ? schemaValue : schemaValue.type;

    if (schema.length === 0) {
      throw new Error(
        `Schema type error for ${schemaFieldName} field, provided array is empty`
      );
    }

    for (let i = 0; i < schema.length; i++) {
      const SchemaTypeConstructor = getSchemaTypeConstructor(
        schema[i] as never
      );
      const fieldName = `${schemaFieldName}["${i}"]`;
      this.nestedSchema[i] = new SchemaTypeConstructor(
        fieldName,
        schema[i] as never
      );
    }
  }

  async assignOrConvertTheRightValue(
    _value: any,
    options?: SchemaTypesConstructorsAssignOrConvertTheRightValueOptions
  ) {
    let value: any[]; // = Array.isArray(_value) ? _value : [_value];

    switch (getTypeof(_value)) {
      case 'string':
        {
          const v = parseJson(_value);
          if (v !== 'invalid') value = v as never;
          else value = [_value];
        }
        break;
      case 'array':
        value = _value;
        break;
      default:
        value = [_value];
    }

    const valueObj = {
      value: [] as any[],
      valueType: 'array',
      hasAssignedValue: false,
    };

    const hasOneSchema = this.nestedSchema.length === 1;

    const appErrorRoot = new AppErrorRoot();

    const validateAndAddValue = (
      nestedSchemaIndex: number,
      nestedSchemaValue: any
    ) => {
      return appErrorRoot.tryCatch(async () => {
        const SchemaTypeConstructor = this.nestedSchema[nestedSchemaIndex];
        let validatedFieldValue: ValidatorValueObj;

        if (options?.onlyConvertTypeForNestedSchema === true) {
          validatedFieldValue =
            await SchemaTypeConstructor.assignOrConvertTheRightValue(
              nestedSchemaValue,
              options
            );
        } else
          validatedFieldValue = await SchemaTypeConstructor.validateFieldValue(
            nestedSchemaValue,
            {
              eventEmitter: options?.eventEmitter,
              schema: options?.schema ?? {},
            }
          );

        if (validatedFieldValue.hasAssignedValue || !hasOneSchema) {
          valueObj.value.push(validatedFieldValue.value);
          valueObj.hasAssignedValue = true;
        }
      });
    };

    if (hasOneSchema) {
      const length = this.length.hasLength ? this.length.value : value.length;
      let i = 0;
      do {
        await validateAndAddValue(0, value[i]);
        i++;
      } while (i < length);
    }

    if (!hasOneSchema) {
      for (let i = 0; i < this.nestedSchema.length; i++) {
        await validateAndAddValue(i, value[i]);
      }
    }

    appErrorRoot.end();

    return valueObj;
  }
}
