import type MongoDbStringSchemaType from '../MongoDbSchemaTypes/MongoDbStringSchemaType.js';

import type MongoDbNumberSchemaType from '../MongoDbSchemaTypes/MongoDbNumberSchemaType.js';

import type MongoDbBooleanSchemaType from '../MongoDbSchemaTypes/MongoDbBooleanSchemaType.js';

import type MongoDbDateSchemaType from '../MongoDbSchemaTypes/MongoDbDateSchemaType.js';

import type MongoDbArraySchemaType from '../MongoDbSchemaTypes/MongoDbArraySchemaType.js';

import type MongoDbObjectSchemaType from '../MongoDbSchemaTypes/MongoDbObjectSchemaType.js';

/*
 *-------------------------------------------------------------*
 *.............................................................*
 *...............SHARED SCHEMA TYPES DEFINITIONS...............*
 *.............................................................*
 *-------------------------------------------------------------*
 */

export type ValidatorArrayWithOptionalErrorMessage<
  FieldType,
  ValidatorValueType
> = [
  ValidatorValueType,
  (
    | string
    | ((
        value: FieldType,
        validatorValue: ValidatorValueType,
        field: string
      ) => string)
  )?
];

export type ValidatorObjectWithOptionalErrorMessage<
  FieldType,
  ValidatorValueType
> = {
  value: ValidatorValueType;
  message?(
    value: FieldType,
    validatorValue: ValidatorValueType,
    field: string
  ): string;
};

type RecursivePartial<T> = {
  [key in keyof T]?: RecursivePartial<T[key]>;
};

export type SharedSchemaTypeValidators<Type> = {
  required?:
    | boolean
    | ValidatorArrayWithOptionalErrorMessage<Type, boolean>
    | ValidatorObjectWithOptionalErrorMessage<Type, boolean>;

  default?: RecursivePartial<Type> | (() => RecursivePartial<Type>);

  validator?:
    | ((value: Type) => boolean)
    | ValidatorArrayWithOptionalErrorMessage<Type, (value: Type) => boolean>
    | ValidatorObjectWithOptionalErrorMessage<Type, (value: Type) => boolean>;
};

type TypeofSchemaValidators = 'string' | 'number' | 'boolean' | 'function';

export type SchemaTypeValidatorsData<
  TypeofValidator extends TypeofSchemaValidators,
  FieldType,
  ValidatorValueType
> = {
  type: TypeofValidator;

  defaultErrorMessage: ValidatorObjectWithOptionalErrorMessage<
    FieldType,
    ValidatorValueType
  >['message'];

  validator(value: FieldType, validatorValue: ValidatorValueType): boolean;
};

export type SharedSchemaTypeValidatorsData = {
  requiredValidator: SchemaTypeValidatorsData<'boolean', boolean, boolean>;

  customValidator: SchemaTypeValidatorsData<
    'function',
    any,
    (value: any) => boolean
  >;
};

export type ReplaceTypeField<Obj> = {
  [Key in keyof Obj as Key extends 'type' ? '_typeField' : Key]: Obj[Key];
};

export type ArrayAndStringSchemaTypeValidatorsData = {
  maxLength: SchemaTypeValidatorsData<'number', string | any[], number>;
  minLength: SchemaTypeValidatorsData<'number', string | any[], number>;
};

/*-------------------------------------------------------------*/

/*
 *-------------------------------------------------------------*
 *.............................................................*
 *...............STRING SCHEMA TYPES DEFINITIONS...............*
 *.............................................................*
 *-------------------------------------------------------------*
 */

export type StringSchemaType<WithShorthandType extends boolean = true> =
  | (WithShorthandType extends true ? 'string' : never)
  | ({
      type: 'string';

      caseType?:
        | 'upperCase'
        | 'lowerCase'
        | 'capitalize'
        | ((value: string) => string);

      maxLength?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<string, number>
        | ValidatorObjectWithOptionalErrorMessage<string, number>;

      minLength?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<string, number>
        | ValidatorObjectWithOptionalErrorMessage<string, number>;
    } & SharedSchemaTypeValidators<string>);

export type StringSchemaTypeValidatorsData =
  ArrayAndStringSchemaTypeValidatorsData;

/*-------------------------------------------------------------*/

/*
 *-------------------------------------------------------------*
 *.............................................................*
 *...............NUMBER SCHEMA TYPES DEFINITIONS...............*
 *.............................................................*
 *-------------------------------------------------------------*
 */

export type NumberSchemaType<WithShorthandType extends boolean = true> =
  | (WithShorthandType extends true ? 'number' : never)
  | ({
      type: 'number';

      min?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<number, number>
        | ValidatorObjectWithOptionalErrorMessage<number, number>;

      max?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<number, number>
        | ValidatorObjectWithOptionalErrorMessage<number, number>;
    } & SharedSchemaTypeValidators<number>);

export type NumberSchemaTypeValidatorsData = {
  max: SchemaTypeValidatorsData<'number', number, number>;
  min: SchemaTypeValidatorsData<'number', number, number>;
};

/*--------------------------------------------------------------*/

/*
 *--------------------------------------------------------------*
 *..............................................................*
 *...............BOOLEAN SCHEMA TYPES DEFINITIONS...............*
 *..............................................................*
 *--------------------------------------------------------------*
 */

export type BooleanSchemaType<WithShorthandType extends boolean = true> =
  | (WithShorthandType extends true ? 'bool' : never)
  | ({
      type: 'bool';
    } & SharedSchemaTypeValidators<boolean>);

/*-----------------------------------------------------------*/

/*
 *-----------------------------------------------------------*
 *...........................................................*
 *...............DATE SCHEMA TYPES DEFINITIONS...............*
 *...........................................................*
 *-----------------------------------------------------------*
 */

export type DateSchemaType<WithShorthandType extends boolean = true> =
  | (WithShorthandType extends true ? 'date' : never)
  | ({
      type: 'date';
    } & SharedSchemaTypeValidators<Date>);

/*------------------------------------------------------------*/

/*
 *------------------------------------------------------------*
 *............................................................*
 *...............ARRAY SCHEMA TYPES DEFINITIONS...............*
 *............................................................*
 *------------------------------------------------------------*
 */

export type ArraySchemaType<
  Type extends object,
  WithShorthandType extends boolean = true
> =
  | (WithShorthandType extends true ? MongoSchema<Required<Type>> : never)
  | ({
      type: MongoSchema<Required<Type>>;

      length?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Type, number>
        | ValidatorObjectWithOptionalErrorMessage<Type, number>;

      maxLength?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Type, number>
        | ValidatorObjectWithOptionalErrorMessage<Type, number>;

      minLength?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Type, number>
        | ValidatorObjectWithOptionalErrorMessage<Type, number>;
    } & SharedSchemaTypeValidators<Type>);

export type ArraySchemaTypeValidatorsData =
  ArrayAndStringSchemaTypeValidatorsData & {
    length: SchemaTypeValidatorsData<'number', any[], number>;
  };

/*-------------------------------------------------------------*/

/*
 *-------------------------------------------------------------*
 *.............................................................*
 *...............OBJECT SCHEMA TYPES DEFINITIONS...............*
 *.............................................................*
 *-------------------------------------------------------------*
 */

export type ObjectSchemaType<Type extends object> = {
  type: MongoSchema<Required<ReplaceTypeField<Type>>>;
} & SharedSchemaTypeValidators<Type>;

/*-------------------------------------------------------------*/

export type MongoSchema<Schema> = ReplaceTypeField<{
  [key in keyof Schema]-?: Required<Schema>[key] extends string
    ? StringSchemaType
    : Required<Schema>[key] extends number
    ? NumberSchemaType
    : Required<Schema>[key] extends Date
    ? DateSchemaType
    : Required<Schema>[key] extends boolean
    ? BooleanSchemaType
    : Required<Schema>[key] extends Array<any>
    ? ArraySchemaType<Required<Schema>[key]>
    : Required<Schema>[key] extends object
    ? ObjectSchemaType<Required<Schema>[key]>
    : never;
}>;

export type SchemaValidationType = 'PARTIAL' | 'FULL' | 'OFF';

export type MongoSchemaTypesConstructors =
  | MongoDbStringSchemaType
  | MongoDbNumberSchemaType
  | MongoDbBooleanSchemaType
  | MongoDbDateSchemaType
  | MongoDbArraySchemaType
  | MongoDbObjectSchemaType;

export type MongoSchemaTypes =
  | 'string'
  | 'number'
  | 'date'
  | 'bool'
  | 'array'
  | 'object';

export type SchemaTypeData<T extends MongoSchemaTypes> = {
  schemaFieldName: string;
  validatorsData: T extends 'string'
    ? StringSchemaTypeValidatorsData
    : T extends 'number'
    ? NumberSchemaTypeValidatorsData
    : T extends 'array'
    ? ArraySchemaTypeValidatorsData
    : Record<string, never>;
  schemaValue: T extends 'string'
    ? StringSchemaType
    : T extends 'number'
    ? NumberSchemaType
    : T extends 'date'
    ? DateSchemaType
    : T extends 'bool'
    ? BooleanSchemaType
    : T extends 'array'
    ? ArraySchemaType<any[]>
    : T extends 'object'
    ? ObjectSchemaType<object>
    : never;
};

export type SchemaTypesConstructorsAssignOrConvertTheRightValueOptions = {
  onlyConvertTypeForNestedSchema?: boolean;
};

export type ValidatorValueObj = {
  valueType: string;
  hasAssignedValue: boolean;
  value: any;
};
