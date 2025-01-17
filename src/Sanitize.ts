import { getTypeof, type UntypedObject } from '@mustib/utils';

import type { ReplaceInString } from './index.js';

type SanitizeMongoKey<
  Key,
  ReplaceDollarWith extends string = '',
  ReplaceDotWith extends string = ''
> = Key extends string
  ? ReplaceInString<
    ReplaceInString<Key, '.', ReplaceDotWith>,
    '$',
    ReplaceDollarWith
  >
  : Key;

type SanitizeMongoDocumentKeyValue<
  Document,
  Key extends keyof Document
> = SanitizeMongoKey<Key> extends keyof Document
  ? Document[SanitizeMongoKey<Key>]
  : Document[Key];

type SanitizeMongoDocument<
  Document,
  ReplaceDollarWith extends string = '',
  ReplaceDotWith extends string = ''
> = {
    [Key in keyof Document as SanitizeMongoKey<
      Key,
      ReplaceDollarWith,
      ReplaceDotWith
    >]: SanitizeMongoDocumentKeyValue<Document, Key> extends object
    ? SanitizeMongoDocument<
      SanitizeMongoDocumentKeyValue<Document, Key>,
      ReplaceDollarWith,
      ReplaceDotWith
    >
    : SanitizeMongoDocumentKeyValue<Document, Key>;
  };

export class Sanitize<
  T extends UntypedObject,
  // NOTE: R & P are just needed for constructor parameters to support types and intelligence
  R extends UntypedObject = any,
  P extends keyof R extends infer K
  ? K extends string
  ? K
  : never
  : never = any
> {
  protected sanitizedFields: Partial<SanitizeMongoDocument<T>> = {};

  protected hasSanitizedAll = false;

  protected get isValidSource(): boolean {
    return getTypeof(this.source) === 'object';
  }

  declare source: T;

  constructor(rootObject: R, prop: P) {
    Object.defineProperty(this, 'source', {
      get() {
        return rootObject[prop];
      },
    });
  }

  static sanitizeKey(key: string | number | symbol) {
    if (typeof key !== 'string') return key;
    const keyWithoutDollarSignAndDot = key.replace(/[.$]/g, '');

    return keyWithoutDollarSignAndDot;
  }

  static sanitize(field: any) {
    if (typeof field !== 'object') return field;

    const fieldEntries = Object.entries(field);

    const sanitizedFields: any = Array.isArray(field) ? [] : {};

    fieldEntries.forEach(([key, value]) => {
      const _key = Sanitize.sanitizeKey(key);

      if (typeof value !== 'object') sanitizedFields[_key] = value;

      const _value = Sanitize.sanitize(value);

      sanitizedFields[_key] = _value;
    });

    return sanitizedFields;
  }

  protected sanitizeField(field: keyof T) {
    const _field = this.source[field];
    if (typeof _field !== 'object') return _field;

    return Sanitize.sanitize(_field);
  }

  protected getPropAndSanitizedProp<Prop extends keyof T>(_prop: Prop) {
    let prop = _prop;
    const sanitizedProp = Sanitize.sanitizeKey(
      prop as string
    ) as SanitizeMongoKey<Prop>;

    const propIsNotSanitized = sanitizedProp !== prop;
    const sanitizedPropIsInSource = sanitizedProp in this.source;
    const sourceHasSanitizedAndNotSanitizedProp =
      propIsNotSanitized && sanitizedPropIsInSource;

    if (sourceHasSanitizedAndNotSanitizedProp) prop = sanitizedProp as Prop;

    return { sanitizedProp, prop };
  }

  protected createSanitizedObjectFromProps(props: (keyof T)[]) {
    const sanitizedObject = {} as any;

    props.forEach((_prop) => {
      if (!(_prop in this.source)) return;

      const { sanitizedProp, prop } = this.getPropAndSanitizedProp(_prop);

      if (sanitizedProp in this.sanitizedFields) {
        sanitizedObject[sanitizedProp] =
          this.sanitizedFields[sanitizedProp as any];
        return;
      }

      const propIsNotObject = typeof this.source[prop] !== 'object';
      if (propIsNotObject) {
        const value = this.source[prop];
        sanitizedObject[sanitizedProp] = value;
        (this.sanitizedFields as any)[sanitizedProp] = value;
        return;
      }

      const sanitizedValue = this.sanitizeField(prop);
      sanitizedObject[sanitizedProp] = sanitizedValue;
      (this.sanitizedFields as any)[sanitizedProp] = sanitizedValue;
    });

    return sanitizedObject as SanitizeMongoDocument<T>;
  }

  protected sanitizeAllFields() {
    if (this.hasSanitizedAll) return this.sanitizedFields;

    const props = Object.keys(this.source);
    this.createSanitizedObjectFromProps(props);
    this.hasSanitizedAll = true;

    return this.sanitizedFields;
  }

  get<
    Keys extends (keyof SanitizeMongoDocument<{ [key in keyof T]: T[key] }>)[]
  >(props?: Keys): SanitizeMongoDocument<{ [key in Keys[number]]: T[key] }> {
    if (!this.isValidSource) return {} as any;

    if (typeof props === 'undefined') return this.sanitizeAllFields() as any;

    return this.createSanitizedObjectFromProps(props as (keyof T)[]) as any;
  }
}
