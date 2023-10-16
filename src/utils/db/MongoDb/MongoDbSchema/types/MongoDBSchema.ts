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

export type ValidatorMetaObject<Schema = UntypedObject> = UntypedObject & {
  fieldName: string;
  schema: Readonly<Schema>;
};

export type ValueofSchemaValidators = number | boolean | Func;
export type TypeofSchemaValidators = 'number' | 'boolean' | 'function';

export type ValidatorArrayWithOptionalErrorMessage<
  Schema,
  FieldType,
  ValidatorValueType extends ValueofSchemaValidators
> = [
  ValidatorValueType,
  (
    | string
    | ((
        value: FieldType,
        validatorValue: ValidatorValueType,
        meta: ValidatorMetaObject<Schema>
      ) => string)
  )?
];

export type ValidatorObjectWithOptionalErrorMessage<
  Schema,
  FieldType,
  ValidatorValueType extends ValueofSchemaValidators
> = {
  value: ValidatorValueType;
  message?(
    value: FieldType,
    validatorValue: ValidatorValueType,
    meta: ValidatorMetaObject<Schema>
  ): string;
};

type RecursivePartial<T> = {
  [key in keyof T]?: RecursivePartial<T[key]>;
};

export type SharedSchemaTypeValidators<Schema, Type> = {
  required?:
    | boolean
    | ValidatorArrayWithOptionalErrorMessage<Schema, Type, boolean>
    | ValidatorObjectWithOptionalErrorMessage<Schema, Type, boolean>;

  default?:
    | RecursivePartial<Type>
    | (() => RecursivePartial<Type> | Promise<RecursivePartial<Type>>);

  validator?:
    | ((
        value: Type,
        meta: ValidatorMetaObject<Schema>
      ) => boolean | Promise<boolean>)
    | ValidatorArrayWithOptionalErrorMessage<
        Schema,
        Type,
        (
          value: Type,
          meta: ValidatorMetaObject<Schema>
        ) => boolean | Promise<boolean>
      >
    | ValidatorObjectWithOptionalErrorMessage<
        Schema,
        Type,
        (
          value: Type,
          meta: ValidatorMetaObject<Schema>
        ) => boolean | Promise<boolean>
      >;
};

export type SchemaTypeValidatorsData<
  TypeofValidator extends TypeofSchemaValidators,
  FieldType,
  ValidatorValueType extends ValueofSchemaValidators
> = {
  type: TypeofValidator;

  defaultErrorMessage: ValidatorObjectWithOptionalErrorMessage<
    UntypedObject,
    FieldType,
    ValidatorValueType
  >['message'];

  validator(
    value: FieldType,
    validatorValue: ValidatorValueType,
    meta: ValidatorMetaObject
  ): boolean | Promise<boolean>;
};

export type SharedSchemaTypeValidatorsData = {
  requiredValidator: SchemaTypeValidatorsData<'boolean', boolean, boolean>;

  customValidator: SchemaTypeValidatorsData<
    'function',
    any,
    (value: any, meta: ValidatorMetaObject) => boolean | Promise<boolean>
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

export type StringSchemaType<
  Schema = UntypedObject,
  WithShorthandType extends boolean = true
> =
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
        | ValidatorArrayWithOptionalErrorMessage<Schema, string, number>
        | ValidatorObjectWithOptionalErrorMessage<Schema, string, number>;

      minLength?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Schema, string, number>
        | ValidatorObjectWithOptionalErrorMessage<Schema, string, number>;
    } & SharedSchemaTypeValidators<Schema, string>);

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

export type NumberSchemaType<
  Schema = UntypedObject,
  WithShorthandType extends boolean = true
> =
  | (WithShorthandType extends true ? 'number' : never)
  | ({
      type: 'number';

      min?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Schema, number, number>
        | ValidatorObjectWithOptionalErrorMessage<Schema, number, number>;

      max?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Schema, number, number>
        | ValidatorObjectWithOptionalErrorMessage<Schema, number, number>;
    } & SharedSchemaTypeValidators<Schema, number>);

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

export type BooleanSchemaType<
  Schema = UntypedObject,
  WithShorthandType extends boolean = true
> =
  | (WithShorthandType extends true ? 'bool' : never)
  | ({
      type: 'bool';
    } & SharedSchemaTypeValidators<Schema, boolean>);

/*-----------------------------------------------------------*/

/*
 *-----------------------------------------------------------*
 *...........................................................*
 *...............DATE SCHEMA TYPES DEFINITIONS...............*
 *...........................................................*
 *-----------------------------------------------------------*
 */

export type DateSchemaType<
  Schema = UntypedObject,
  WithShorthandType extends boolean = true
> =
  | (WithShorthandType extends true ? 'date' : never)
  | ({
      type: 'date';
    } & SharedSchemaTypeValidators<Schema, Date>);

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
  Schema = Type,
  WithShorthandType extends boolean = true
> =
  | (WithShorthandType extends true ? MongoSchema<Required<Type>> : never)
  | ({
      type: MongoSchema<Required<Type>, Schema>;

      length?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Schema, Type, number>
        | ValidatorObjectWithOptionalErrorMessage<Schema, Type, number>;

      maxLength?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Schema, Type, number>
        | ValidatorObjectWithOptionalErrorMessage<Schema, Type, number>;

      minLength?:
        | number
        | ValidatorArrayWithOptionalErrorMessage<Schema, Type, number>
        | ValidatorObjectWithOptionalErrorMessage<Schema, Type, number>;
    } & SharedSchemaTypeValidators<Schema, Type>);

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

export type ObjectSchemaType<Type extends object, Schema = Type> = {
  type: MongoSchema<Required<ReplaceTypeField<Type>>, Schema>;
} & SharedSchemaTypeValidators<Schema, Type>;

/*-------------------------------------------------------------*/

export type MongoSchema<Schema, OriginalSchema = Schema> = ReplaceTypeField<{
  [key in keyof Schema]-?: Required<Schema>[key] extends string
    ? StringSchemaType<OriginalSchema>
    : Required<Schema>[key] extends number
    ? NumberSchemaType<OriginalSchema>
    : Required<Schema>[key] extends Date
    ? DateSchemaType<OriginalSchema>
    : Required<Schema>[key] extends boolean
    ? BooleanSchemaType<OriginalSchema>
    : Required<Schema>[key] extends Array<any>
    ? ArraySchemaType<Required<Schema>[key], OriginalSchema>
    : Required<Schema>[key] extends object
    ? ObjectSchemaType<Required<Schema>[key], OriginalSchema>
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
  schema?: UntypedObject;
};

export type SchemaTypesConstructorsValidateFieldValueOptions = {
  schema: UntypedObject;
};

export type ValidatorValueObj = {
  valueType: string;
  hasAssignedValue: boolean;
  value: any;
};
