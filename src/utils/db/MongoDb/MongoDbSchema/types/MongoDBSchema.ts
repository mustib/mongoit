import type { Document } from 'mongodb';
import type MongoDbStringSchemaType from '../MongoDbSchemaTypes/MongoDbStringSchemaType';
import type MongoDbNumberSchemaType from '../MongoDbSchemaTypes/MongoDbNumberSchemaType';
import type MongoDbDateSchemaType from '../MongoDbSchemaTypes/MongoDbDateSchemaType';
import type MongoDbArraySchemaType from '../MongoDbSchemaTypes/MongoDbArraySchemaType';
import type MongoDbObjectSchemaType from '../MongoDbSchemaTypes/MongoDbObjectSchemaType';

type RecursivePartial<T> = {
  [key in keyof T]?: RecursivePartial<T[key]>;
};

type SharedSchemaTypeFields<Type> = {
  required?: ValidatorWithOptionalErrorMessage<boolean>;
  default?: RecursivePartial<Type>;
};

type ReplaceTypeField<Obj extends object> = {
  [Key in keyof Obj as Key extends 'type' ? '_typeField' : Key]: Obj[Key];
};

type WithShorthandSchemaType<Type extends { type: any }> = Type['type'] | Type;

type ValidatorObjectWithOptionalErrorMessage<Type> = {
  value: Type;
  message?: string | SchemaTypeValidatorsData['defaultErrorMessage'];
};

type ValidatorWithOptionalErrorMessage<Type> =
  | Type
  | ValidatorObjectWithOptionalErrorMessage<Type>
  | [Type, (string | SchemaTypeValidatorsData['defaultErrorMessage'])?];

type ArrayAndStringShared = {
  minLength?: ValidatorWithOptionalErrorMessage<number>;
  maxLength?: ValidatorWithOptionalErrorMessage<number>;
};

type StringSchemaType = {
  type: 'string';
} & ArrayAndStringShared;

type NumberSchemaType = {
  type: 'number';
  min?: ValidatorWithOptionalErrorMessage<number>;
  max?: ValidatorWithOptionalErrorMessage<number>;
};

type DateSchemaType = {
  type: 'date';
};

type ArraySchemaType<Type extends object> = {
  type: Required<Type>;
  length?: ValidatorWithOptionalErrorMessage<number>;
} & ArrayAndStringShared;

type ObjectSchemaType<Type extends object> = {
  type: Required<ReplaceTypeField<Type>>;
};

type PrimitiveFields = string | number | Date;

type SchemaPrimitiveField<Field extends PrimitiveFields> = Field extends string
  ? StringSchemaType
  : Field extends number
  ? NumberSchemaType
  : Field extends Date
  ? DateSchemaType
  : never;

type ReferenceFields = Array<any> | object;

type SchemaReferenceField<Field extends ReferenceFields> = {
  [key in keyof Field]: Field[key] extends PrimitiveFields
    ? WithShorthandSchemaType<
        SchemaPrimitiveField<Field[key]> & SharedSchemaTypeFields<Field[key]>
      >
    : Field[key] extends Array<any>
    ? WithShorthandSchemaType<
        ArraySchemaType<SchemaReferenceField<Field[key]>> &
          SharedSchemaTypeFields<Field[key]>
      >
    : Field[key] extends object
    ? SharedSchemaTypeFields<Field[key]> &
        ObjectSchemaType<SchemaReferenceField<Field[key]>>
    : never;
};

type MongoSchema<Schema extends Document> = Schema extends Array<any>
  ? never
  : ReplaceTypeField<{
      [key in keyof Schema]: Schema[key] extends PrimitiveFields
        ? WithShorthandSchemaType<
            SharedSchemaTypeFields<Schema[key]> &
              SchemaPrimitiveField<Schema[key]>
          >
        : Schema[key] extends Array<any>
        ? WithShorthandSchemaType<
            SharedSchemaTypeFields<Schema[key]> &
              ArraySchemaType<SchemaReferenceField<Schema[key]>>
          >
        : Schema[key] extends object
        ? SharedSchemaTypeFields<Schema[key]> &
            ObjectSchemaType<SchemaReferenceField<Schema[key]>>
        : never;
    }>;

type MongoSchemaTypes = 'string' | 'number' | 'date' | 'array' | 'object';

type MongoSchemaTypesConstructors =
  | MongoDbStringSchemaType
  | MongoDbNumberSchemaType
  | MongoDbDateSchemaType
  | MongoDbArraySchemaType
  | MongoDbObjectSchemaType;

type GetSchemaTypeValidatorKeys<Type extends MongoSchemaTypes> =
  keyof (Type extends 'string'
    ? Omit<StringSchemaType, 'type'>
    : Type extends 'number'
    ? Omit<NumberSchemaType, 'type'>
    : Type extends 'date'
    ? Omit<DateSchemaType, 'type'>
    : Type extends 'array'
    ? Omit<ArraySchemaType<any>, 'type'>
    : Type extends 'object'
    ? Omit<ObjectSchemaType<any>, 'type'>
    : never);

type ValidatorValueObj = {
  valueType: string;
  hasAssignedValue: boolean;
  value: any;
};

type SchemaTypeValidatorsData = {
  type: SchemaTypeValidatorsTypes;
  defaultErrorMessage(value: any, validatorValue: any, field: string): string;
  validator(value: any, validatorValue: string | number | boolean): boolean;
};

type SchemaTypeValidatorsTypes = 'string' | 'number' | 'boolean';

type SchemaTypeValidators<T extends MongoSchemaTypes = any> = {
  [key in T extends MongoSchemaTypes
    ? GetSchemaTypeValidatorKeys<T>
    : keyof UntypedObject]: SchemaTypeValidatorsData;
};

type SchemaTypeData = {
  schemaFieldName: string;
  validatorsData: SchemaTypeValidators;
  schemaValue: (
    | WithShorthandSchemaType<
        | StringSchemaType
        | NumberSchemaType
        | DateSchemaType
        | ArraySchemaType<any>
      >
    | ObjectSchemaType<any>
  ) &
    SharedSchemaTypeFields<any>;
};

export type {
  MongoSchema,
  MongoSchemaTypes,
  MongoSchemaTypesConstructors,
  ValidatorValueObj,
  SchemaTypeData,
  SchemaTypeValidatorsTypes,
  SchemaTypeValidatorsData,
  SchemaTypeValidators,
  ValidatorWithOptionalErrorMessage,
  ValidatorObjectWithOptionalErrorMessage,
  WithShorthandSchemaType,
  StringSchemaType,
  NumberSchemaType,
  DateSchemaType,
  ArraySchemaType,
  ObjectSchemaType,
  SharedSchemaTypeFields,
};
