import { DecimalCount } from './types';

export interface FormattedValue {
  text: string;
  prefix?: string;
  suffix?: string;
}

export type ValueFormatterOptions = {
  decimals?: DecimalCount;
  scaledDecimals?: DecimalCount;
  timeZone?: string;
  skipScale?: boolean;
  opts?: Intl.NumberFormatOptions;
};

export type ValueFormatter = (value: number, options?: ValueFormatterOptions) => FormattedValue;

export interface ValueFormat {
  name: string;
  id: string;
  fn: ValueFormatter;
}

export interface ValueFormatCategory {
  name: string;
  formats: ValueFormat[];
}

export function toFixed(value: number, decimals?: DecimalCount, opts?: Intl.NumberFormatOptions): string {
  if (value === null) {
    return '';
  }
  if (value === Number.NEGATIVE_INFINITY || value === Number.POSITIVE_INFINITY) {
    return value.toLocaleString();
  }

  // Default mantissa.
  let mantissa = 3;

  // Handle special cases.
  if (value > -1 && value < 1) {
    // Small value so increase mantissa.
    mantissa = 4;
  } else if (value > Number.MAX_SAFE_INTEGER) {
    // Huge number, so no need for one.
    mantissa = 0;
  }

  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: typeof decimals === 'number' ? decimals : mantissa,
    ...opts,
  };

  return new Intl.NumberFormat(undefined, options).format(value);
}

export function toFixedScaled(
  value: number,
  decimals: DecimalCount,
  scaledDecimals: DecimalCount,
  additionalDecimals: number,
  ext?: string,
  opts?: Intl.NumberFormatOptions
): FormattedValue {
  if (scaledDecimals === null || scaledDecimals === undefined) {
    return { text: toFixed(value, decimals, opts), suffix: ext };
  }

  return {
    text: toFixed(value, scaledDecimals + additionalDecimals, opts),
    suffix: ext,
  };
}

export function toFixedUnit(unit: string, asPrefix?: boolean): ValueFormatter {
  return (size: number, args?: ValueFormatterOptions) => {
    const { decimals, opts } = args || {};
    if (size === null) {
      return { text: '' };
    }
    const text = toFixed(size, decimals, opts);
    if (unit) {
      if (asPrefix) {
        return { text: text, prefix: unit };
      }

      return { text: text, suffix: ` ${unit}` };
    }

    return { text: text };
  };
}

// Formatter which scales the unit string geometrically according to the given
// numeric factor. Repeatedly scales the value down by the factor until it is
// less than the factor in magnitude, or the end of the array is reached.
export function scaledUnits(factor: number, extArray: string[]): ValueFormatter {
  return (size: number, options?: ValueFormatterOptions) => {
    const { decimals, skipScale, scaledDecimals, opts } = options || {};
    if (size === null) {
      return { text: '' };
    }
    if (size === Number.NEGATIVE_INFINITY || size === Number.POSITIVE_INFINITY || isNaN(size)) {
      return { text: size.toLocaleString() };
    }

    let sizeCopy = size;
    let decimalsCopy = decimals;

    let steps = 0;
    const limit = extArray.length;

    while (!skipScale && Math.abs(sizeCopy) >= factor) {
      steps += 1;
      sizeCopy = sizeCopy / factor;

      if (steps >= limit) {
        return { text: 'NA' };
      }
    }

    if (steps > 0 && scaledDecimals !== null && scaledDecimals !== undefined) {
      decimalsCopy = scaledDecimals + steps * 3;
    }

    return { text: toFixed(sizeCopy, decimalsCopy, opts), suffix: extArray[steps] };
  };
}

export function simpleCountUnit(symbol: string): ValueFormatter {
  const units = ['', 'K', 'M', 'B', 'T'];
  const scaler = scaledUnits(1000, units);

  return (size: number, options?: ValueFormatterOptions) => {
    if (size === null) {
      return { text: '' };
    }

    const v = scaler(size, options);
    v.suffix += ` ${symbol}`;

    return v;
  };
}
