import type { ReplaceInString } from '../../../types/ReplaceInString';

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

class MongoSanitize<T extends UntypedObject> {
  protected sanitizedFields: Partial<SanitizeMongoDocument<T>> = {};

  protected hasSanitizedAll = false;

  protected isValidSource: boolean;

  constructor(protected source: T) {
    if (typeof source === 'object') this.isValidSource = true;
    else this.isValidSource = false;
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
      const _key = MongoSanitize.sanitizeKey(key);

      if (typeof value !== 'object') sanitizedFields[_key] = value;

      const _value = MongoSanitize.sanitize(value);

      sanitizedFields[_key] = _value;
    });

    return sanitizedFields;
  }

  protected sanitizeField(field: keyof T) {
    const _field = this.source[field];
    if (typeof _field !== 'object') return _field;

    return MongoSanitize.sanitize(_field);
  }

  protected getPropAndSanitizedProp<Prop extends keyof T>(_prop: Prop) {
    let prop = _prop;
    const sanitizedProp = MongoSanitize.sanitizeKey(
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

  get<Keys extends keyof T = keyof T>(
    props?: (keyof SanitizeMongoDocument<{ [key in Keys]: T[key] }>)[]
  ): SanitizeMongoDocument<{ [key in Keys]: T[key] }> {
    if (!this.isValidSource) return {} as any;

    if (typeof props === 'undefined') return this.sanitizeAllFields() as any;

    return this.createSanitizedObjectFromProps(props as (keyof T)[]) as any;
  }
}

export default MongoSanitize;
