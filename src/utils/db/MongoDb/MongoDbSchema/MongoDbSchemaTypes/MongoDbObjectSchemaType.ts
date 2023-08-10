import getTypeof from '../../../../getTypeof';
import getSchemaTypeConstructor from '../utils/getSchemaTypeConstructor';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType';

import type {
  MongoSchemaTypesConstructors,
  ObjectSchemaType,
  SharedSchemaTypeFields,
} from '../types/MongoDBSchema';

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

  assignOrConvertTheRightValue(_value: any) {
    let valueType = getTypeof(_value);
    const value = valueType === 'object' ? _value : {};
    let hasAssignedValue = false;

    const nestedSchemaEntries = Object.entries(this.nestedSchema);

    if (nestedSchemaEntries.length === 0)
      return { valueType, hasAssignedValue, value };

    nestedSchemaEntries.forEach(([schemaName, schema]) => {
      const validatedFieldValue = schema.validateFieldValue(value[schemaName]);

      if (validatedFieldValue.hasAssignedValue) {
        value[schemaName] = validatedFieldValue.value;
        hasAssignedValue = true;
        valueType = 'object';
      }
    });

    return { valueType, hasAssignedValue, value };
  }
}

export default MongoDbObjectSchemaType;
