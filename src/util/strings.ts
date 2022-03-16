import { FieldValueFormatters } from '../stores/DatasetStore';

import { formattedValueToStr } from './units/units';

export function stripAnsi(value: string): string {
  // cSpell:disable
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
  ].join('|');
  // cSpell:enable

  const ansiRegex = new RegExp(pattern, 'g');

  return value.replace(ansiRegex, '');
}

export const formatAnyValue = (value: any, name?: string, fieldValueFormatters?: FieldValueFormatters): string => {
  if (value === undefined || value === null) {
    return '<nil>';
  }

  const valueFormatter = name && fieldValueFormatters ? fieldValueFormatters[name] : undefined;
  if (valueFormatter) {
    return formattedValueToStr(valueFormatter(value, { skipScale: true }));
  }

  // 🐉🐉🐉
  // Arrays are objects so keep this check before `typeof value === 'object'`
  if (Array.isArray(value)) {
    // Run each array value through formatAnyValue. (Ansi needs to be stripped at a minimum)
    return JSON.stringify(
      value.map((vv) => {
        // Don't run objects through `formatAnyValue` otherwise they'll be stringified twice.
        if (typeof vv === 'object') {
          return vv;
        } else {
          return formatAnyValue(vv);
        }
      }),
      undefined,
      2
    );
  }

  if (typeof value === 'object') {
    // FUTURE: Run all properties through formatAnyValue?
    return JSON.stringify(value, undefined, 2);
  }

  if (typeof value === 'number') {
    // Don't format numbers that are likely Unix timestamps.
    const numberString = String(value);
    if (numberString.length === 13) {
      const nameLower = name?.toLocaleLowerCase();
      if (nameLower && (nameLower.includes('time') || nameLower.includes('date'))) {
        return String(value);
      }
    }

    // Set maximumFractionDigits to the max.
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 20 }).format(value);
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  return stripAnsi(String(value));
};
