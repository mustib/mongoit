import getTypeof from '../../../../getTypeof.js';
import AppErrorRoot from '../../../../AppError/AppErrorRoot.js';
import getSchemaTypeConstructor from '../utils/getSchemaTypeConstructor.js';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType.js';

import type {
  MongoSchemaTypesConstructors,
  ObjectSchemaType,
  SchemaTypesConstructorsAssignOrConvertTheRightValueOptions,
  SharedSchemaTypeFields,
  ValidatorValueObj,
} from '../types/MongoDBSchema.js';

class MongoDbObjectSchemaType extends AbstractMongoDbSchemaType<'object'> {
  nestedSchema: { [key: string | number]: MongoSchemaTypesConstructors } = {};

  constructor(
    schemaFieldName: string,
    schemaValue: ObjectSchemaType<any> & SharedSchemaTypeFields<any>
  ) {
    super();
    this.createNestedSchema(schemaValue.type, schemaFieldName);
    this.init('object', { schemaFieldName, schemaValue, validatorsData: {} });
  }

  createNestedSchema(
    schemaValue: (ObjectSchemaType<any> & SharedSchemaTypeFields<any>)['type'],
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
        schema
      );
    });
  }

  assignOrConvertTheRightValue(
    _value: any,
    options?: SchemaTypesConstructorsAssignOrConvertTheRightValueOptions
  ) {
    const value = getTypeof(_value) === 'object' ? _value : {};

    const valueObj: ValidatorValueObj = {
      value: {},
      valueType: 'object',
      hasAssignedValue: false,
    };

    const nestedSchemaEntries = Object.entries(this.nestedSchema);

    if (nestedSchemaEntries.length === 0) return valueObj;

    AppErrorRoot.aggregate((tryCatch) => {
      nestedSchemaEntries.forEach(([schemaName, schema]) => {
        tryCatch(() => {
          let validatedFieldValue: ValidatorValueObj;

          if (options?.onlyConvertTypeForNestedSchema === true) {
            validatedFieldValue = schema.assignOrConvertTheRightValue(
              value[schemaName],
              options
            );
          } else
            validatedFieldValue = schema.validateFieldValue(value[schemaName]);

          if (validatedFieldValue.hasAssignedValue) {
            valueObj.value[schemaName] = validatedFieldValue.value;
            valueObj.hasAssignedValue = true;
          }
        });
      });
    });

    return valueObj;
  }
}

export default MongoDbObjectSchemaType;
