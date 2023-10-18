function getTypeof(value: any) {
  if (value instanceof Uint8Array) return 'buffer';

  const type = typeof value;

  if (
    type === 'string' ||
    type === 'boolean' ||
    type === 'undefined' ||
    type === 'function'
  ) {
    return type;
  }

  if (type === 'number') {
    if (Number.isNaN(value)) return 'NaN';
    return 'number';
  }

  if (type === 'object') {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    if (value instanceof Date) {
      if (value.toString() === 'Invalid Date') return 'invalid_date';
      return 'date';
    }
    if (value instanceof Uint8Array || value instanceof ArrayBuffer)
      return 'buffer';

    return 'object';
  }

  return 'unknown';
}

export default getTypeof;
