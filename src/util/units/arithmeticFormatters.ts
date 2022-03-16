import { FormattedValue, toFixed, ValueFormatterOptions } from './valueFormats';

export function toPercent(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, opts } = options || {};

  return { text: toFixed(size, decimals, opts), suffix: '%' };
}

export function toPercentUnit(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, opts } = options || {};

  return { text: toFixed(size * 100, decimals, opts), suffix: '%' };
}
