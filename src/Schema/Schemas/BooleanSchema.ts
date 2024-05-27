import { getTypeof } from '@mustib/utils';

import { AbstractSchema } from './AbstractSchema.js';

import type { BooleanSchemaType } from '../types/index.js';

export class BooleanSchema extends AbstractSchema<'bool'> {
  assignOrConvertTheRightValue(_value: any) {
    let value;
    const valueType: ReturnType<typeof getTypeof> = getTypeof(_value);
    let hasAssignedValue = false;

    if (valueType === 'boolean') {
      value = _value;
      hasAssignedValue = true;
    }

    return { value, valueType, hasAssignedValue };
  }

  constructor(schemaFieldName: string, schemaValue: BooleanSchemaType) {
    super();
    this.init('bool', {
      schemaFieldName,
      schemaValue,
      validatorsData: {},
    });
  }
}
