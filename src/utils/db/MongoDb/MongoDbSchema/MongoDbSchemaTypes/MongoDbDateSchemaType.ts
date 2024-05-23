import { getTypeof } from '@mustib/utils';
import AbstractMongoDbSchemaType from './AbstractMongoDbSchemaType.js';

import type {
  DateSchemaType,
  SchemaTypesConstructorsAssignOrConvertTheRightValueOptions,
  ValidatorValueObj,
} from '../types/MongoDBSchema.js';

class MongoDbDateSchemaType extends AbstractMongoDbSchemaType<'date'> {
  constructor(schemaFieldName: string, schemaValue: DateSchemaType) {
    super();
    this.init('date', { schemaFieldName, schemaValue, validatorsData: {} });
  }

  async assignOrConvertTheRightValue(
    _value: any,
    options?: SchemaTypesConstructorsAssignOrConvertTheRightValueOptions
  ) {
    if (options?.onlyConvertTypeForNestedSchema) await this.initialize;
    const valueObj: ValidatorValueObj = {
      value: undefined,
      hasAssignedValue: false,
      valueType: getTypeof(_value),
    };

    const addValueToValueObj = (value: any) => {
      valueObj.value = (value as Date).toISOString();
      valueObj.hasAssignedValue = true;
      valueObj.valueType = 'date';
    };

    if (valueObj.valueType === 'date') addValueToValueObj(_value);
    else if (valueObj.valueType === 'string') {
      const possibleStringOrNumberDateValue = Number.isNaN(+_value)
        ? _value
        : +_value;
      const possibleDate = new Date(possibleStringOrNumberDateValue);

      if (getTypeof(possibleDate) === 'date') addValueToValueObj(possibleDate);
    } else if (valueObj.valueType === 'number') {
      const possibleNumberDate = new Date(_value);

      if (getTypeof(possibleNumberDate) === 'date')
        addValueToValueObj(possibleNumberDate);
    }
    return valueObj;
  }
}

export default MongoDbDateSchemaType;
