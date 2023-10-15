import getTypeof from '../../../../getTypeof.js';
import getValidJson from '../../../../getValidJson.js';
import AppErrorRoot from '../../../../AppError/AppErrorRoot.js';
import getSchemaTypeConstructor from '../utils/getSchemaTypeConstructor.js';
import arrayAndStringValidatorsData from '../config/arrayAndStringValidatorsData.js';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType.js';

import type {
  MongoSchemaTypesConstructors,
  ValidatorValueObj,
  SchemaTypesConstructorsAssignOrConvertTheRightValueOptions,
  ArraySchemaType,
  ArraySchemaTypeValidatorsData,
} from '../types/MongoDBSchema.js';

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

class MongoDbArraySchemaType extends AbstractMongoDbSchemaType<'array'> {
  nestedSchema: MongoSchemaTypesConstructors[] = [];

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
      const SchemaTypeConstructor = getSchemaTypeConstructor(schema[i]);
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
          const v = getValidJson(_value);
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
            nestedSchemaValue
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

export default MongoDbArraySchemaType;
