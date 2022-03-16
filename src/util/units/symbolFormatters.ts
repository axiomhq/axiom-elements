import { scaledUnits, ValueFormatter, ValueFormatterOptions } from './valueFormats';

export function currency(symbol: string, asSuffix?: boolean): ValueFormatter {
  const units = ['', 'K', 'M', 'B', 'T'];
  const scaler = scaledUnits(1000, units);

  return (size: number, options?: ValueFormatterOptions) => {
    if (size === null) {
      return { text: '' };
    }

    const scaled = scaler(size, options);
    if (asSuffix) {
      scaled.suffix = scaled.suffix !== undefined ? `${scaled.suffix}${symbol}` : undefined;
    } else {
      scaled.prefix = symbol;
    }

    return scaled;
  };
}

export function binarySIPrefix(unit: string, offset = 0): ValueFormatter {
  const prefixes = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'].slice(offset);
  const units = prefixes.map((p) => {
    // return ' ' + p + unit;
    return ` ${p}${unit}`;
  });

  return scaledUnits(1024, units);
}

export function decimalSIPrefix(unit: string, offset = 0): ValueFormatter {
  let prefixes = ['f', 'p', 'n', 'µ', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  prefixes = prefixes.slice((offset || 0) + 5);
  const units = prefixes.map((p) => {
    // return ' ' + p + unit;
    return ` ${p}${unit}`;
  });

  return scaledUnits(1000, units);
}
