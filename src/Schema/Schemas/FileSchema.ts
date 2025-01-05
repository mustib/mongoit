import fs from 'fs';

import { randomUUID } from 'crypto';

import { fileTypeFromBuffer } from 'file-type';

import { getTypeof } from '@mustib/utils';

import { AbstractSchema } from './AbstractSchema.js';

import type {
  FileSchemaType,
  FileSchemaTypeValidatorsData,
  FileSchemaTypes,
  FileTypeValidatedFileValue,
  SchemaEvents,
  SchemaTypesConstructorsValidateFieldValueOptions,
  ReplaceInString,
} from '../../index.js';

const saveSignals: {
  [key in keyof Required<
    Required<FileSchemaType<any>>['saveSignal']
  >]: Lowercase<ReplaceInString<key, 'after'>>;
} = {
  afterInsert: 'insert',
  afterValidate: 'validate',
};

const validatorsData: FileSchemaTypeValidatorsData = {
  extensions: {
    type: 'array',

    defaultErrorMessage(value, validatorValue, { fieldName }) {
      return `unsupported extension "${
        value.ext
      }" for ${fieldName} field only supported extensions are (${validatorValue.join(
        ', '
      )})`;
    },

    validator(value, validatorValue) {
      return validatorValue.includes(value.ext);
    },
  },

  maxSize: {
    type: 'number',

    defaultErrorMessage(value, validatorValue, meta) {
      return `maximum size for ${meta.fieldName} field is ${validatorValue} byte but instead got ${value.buffer.byteLength} byte`;
    },

    validator(value, validatorValue) {
      return value.buffer.byteLength <= validatorValue;
    },
  },
};

export class FileSchema extends AbstractSchema<FileSchemaTypes> {
  saveSignal: FileSchemaType<any>['saveSignal'];

  private _fileName: FileSchemaType<any>['fileName'];

  get fileName() {
    // eslint-disable-next-line no-nested-ternary
    return typeof this._fileName === 'string'
      ? this._fileName
      : typeof this._fileName === 'function'
      ? this._fileName()
      : `${Date.now().toString(36)}${randomUUID()
          .replaceAll('-', '')
          .toString()}.jpg`;
  }

  constructor(schemaFieldName: string, schemaValue: FileSchemaType<any>) {
    super();
    this.saveSignal = schemaValue.saveSignal;
    this._fileName = schemaValue.fileName;
    this.init(schemaValue.type, {
      schemaFieldName,
      schemaValue,
      validatorsData,
    });
  }

  async assignOrConvertTheRightValue(_value: any) {
    let value;
    const _valueType = getTypeof(_value);
    let valueType: string = _valueType;
    let hasAssignedValue = false;

    const checkValue = async (buffer: ArrayBuffer | Uint8Array) => {
      const { mime = '', ext = '' } = (await fileTypeFromBuffer(buffer)) || {};
      if (mime.startsWith(this.type)) {
        valueType = this.type;
        hasAssignedValue = true;
        value = { buffer, mime, ext };
      }
    };

    switch (_valueType) {
      case 'buffer':
        await checkValue(_value);
        break;
      case 'string':
        if (fs.existsSync(_value))
          // as any to fix rollup dts plugin build error
          await checkValue(fs.readFileSync(_value).buffer as any);
        break;
      default:
        break;
    }

    return { value, valueType, hasAssignedValue };
  }

  saveFile(
    fileName: string,
    validatedValue: FileTypeValidatedFileValue,
    eventEmitter?: SchemaEvents
  ) {
    const { saveSignal } = this;
    if (!eventEmitter || !saveSignal) return;

    const signalKeys = Object.keys(saveSignal) as Required<
      keyof Required<FileSchemaType<any>>['saveSignal']
    >[];

    signalKeys.forEach((signal) => {
      const meta = { ...validatedValue, fileName };
      eventEmitter.once(saveSignals[signal], (...args) => {
        saveSignal[signal]?.(Object.assign(meta, ...args));
      });
    });
  }

  async validateFieldValue(
    _value: any,
    options: SchemaTypesConstructorsValidateFieldValueOptions
  ) {
    const validated = await AbstractSchema.prototype.validateFieldValue.bind(
      this
    )(_value, options);

    if (validated.hasAssignedValue) {
      const { fileName } = this;

      this.saveFile(fileName, validated.value, options.eventEmitter);

      validated.value = fileName;
    }

    return validated;
  }
}
