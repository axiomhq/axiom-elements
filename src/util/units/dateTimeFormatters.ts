// cSpell:ignore Milli

import { formatDateAsIso } from '../dates';

import { DecimalCount } from './types';
import { FormattedValue, toFixed, toFixedScaled, ValueFormatterOptions } from './valueFormats';

export function toNanoSeconds(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, scaledDecimals, opts } = options || {};

  if (Math.abs(size) < 1000) {
    return { text: toFixed(size, decimals, opts), suffix: ' ns' };
  } else if (Math.abs(size) < 1000000) {
    return toFixedScaled(size / 1000, decimals, scaledDecimals, 3, ' µs', opts);
  } else if (Math.abs(size) < 1000000000) {
    return toFixedScaled(size / 1000000, decimals, scaledDecimals, 6, ' ms', opts);
  } else if (Math.abs(size) < 60000000000) {
    return toFixedScaled(size / 1000000000, decimals, scaledDecimals, 9, ' s', opts);
  } else if (Math.abs(size) < 3600000000000) {
    return toFixedScaled(size / 60000000000, decimals, scaledDecimals, 12, ' min', opts);
  } else if (Math.abs(size) < 86400000000000) {
    return toFixedScaled(size / 3600000000000, decimals, scaledDecimals, 13, ' hour', opts);
  } else {
    return toFixedScaled(size / 86400000000000, decimals, scaledDecimals, 14, ' day', opts);
  }
}

export function toMicroSeconds(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, scaledDecimals, opts } = options || {};

  if (Math.abs(size) < 1000) {
    return { text: toFixed(size, decimals, opts), suffix: ' µs' };
  } else if (Math.abs(size) < 1000000) {
    return toFixedScaled(size / 1000, decimals, scaledDecimals, 3, ' ms', opts);
  } else {
    return toFixedScaled(size / 1000000, decimals, scaledDecimals, 6, ' s', opts);
  }
}

export function toMilliSeconds(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, scaledDecimals, opts } = options || {};

  if (Math.abs(size) < 1000) {
    return { text: toFixed(size, decimals, opts), suffix: ' ms' };
  } else if (Math.abs(size) < 60000) {
    // Less than 1 min
    return toFixedScaled(size / 1000, decimals, scaledDecimals, 3, ' s', opts);
  } else if (Math.abs(size) < 3600000) {
    // Less than 1 hour, divide in minutes
    return toFixedScaled(size / 60000, decimals, scaledDecimals, 5, ' min', opts);
  } else if (Math.abs(size) < 86400000) {
    // Less than one day, divide in hours
    return toFixedScaled(size / 3600000, decimals, scaledDecimals, 7, ' hour', opts);
  } else if (Math.abs(size) < 31536000000) {
    // Less than one year, divide in days
    return toFixedScaled(size / 86400000, decimals, scaledDecimals, 8, ' day', opts);
  }

  return toFixedScaled(size / 31536000000, decimals, scaledDecimals, 10, ' year', opts);
}

export function trySubtract(value1: DecimalCount, value2: DecimalCount): DecimalCount {
  if (value1 !== null && value1 !== undefined && value2 !== null && value2 !== undefined) {
    return value1 - value2;
  }

  return undefined;
}

export function toSeconds(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, scaledDecimals, opts } = options || {};

  // Less than 1 µs, divide in ns
  if (Math.abs(size) < 0.000001) {
    return toFixedScaled(size * 1e9, decimals, trySubtract(scaledDecimals, decimals), -9, ' ns', opts);
  }
  // Less than 1 ms, divide in µs
  if (Math.abs(size) < 0.001) {
    return toFixedScaled(size * 1e6, decimals, trySubtract(scaledDecimals, decimals), -6, ' µs', opts);
  }
  // Less than 1 second, divide in ms
  if (Math.abs(size) < 1) {
    return toFixedScaled(size * 1e3, decimals, trySubtract(scaledDecimals, decimals), -3, ' ms', opts);
  }

  if (Math.abs(size) < 60) {
    return { text: toFixed(size, decimals, opts), suffix: ' s' };
  } else if (Math.abs(size) < 3600) {
    // Less than 1 hour, divide in minutes
    return toFixedScaled(size / 60, decimals, scaledDecimals, 1, ' min', opts);
  } else if (Math.abs(size) < 86400) {
    // Less than one day, divide in hours
    return toFixedScaled(size / 3600, decimals, scaledDecimals, 4, ' hour', opts);
  } else if (Math.abs(size) < 604800) {
    // Less than one week, divide in days
    return toFixedScaled(size / 86400, decimals, scaledDecimals, 5, ' day', opts);
  } else if (Math.abs(size) < 31536000) {
    // Less than one year, divide in week
    return toFixedScaled(size / 604800, decimals, scaledDecimals, 6, ' week', opts);
  }

  return toFixedScaled(size / 3.15569e7, decimals, scaledDecimals, 7, ' year', opts);
}

export function toMinutes(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, scaledDecimals, opts } = options || {};

  if (Math.abs(size) < 60) {
    return { text: toFixed(size, decimals, opts), suffix: ' min' };
  } else if (Math.abs(size) < 1440) {
    return toFixedScaled(size / 60, decimals, scaledDecimals, 2, ' hour', opts);
  } else if (Math.abs(size) < 10080) {
    return toFixedScaled(size / 1440, decimals, scaledDecimals, 3, ' day', opts);
  } else if (Math.abs(size) < 604800) {
    return toFixedScaled(size / 10080, decimals, scaledDecimals, 4, ' week', opts);
  } else {
    return toFixedScaled(size / 5.25948e5, decimals, scaledDecimals, 5, ' year', opts);
  }
}

export function toHours(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, scaledDecimals, opts } = options || {};

  if (Math.abs(size) < 24) {
    return { text: toFixed(size, decimals, opts), suffix: ' hour' };
  } else if (Math.abs(size) < 168) {
    return toFixedScaled(size / 24, decimals, scaledDecimals, 2, ' day', opts);
  } else if (Math.abs(size) < 8760) {
    return toFixedScaled(size / 168, decimals, scaledDecimals, 3, ' week', opts);
  } else {
    return toFixedScaled(size / 8760, decimals, scaledDecimals, 4, ' year', opts);
  }
}

export function toDays(size: number, options?: ValueFormatterOptions): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  const { decimals, scaledDecimals, opts } = options || {};

  if (Math.abs(size) < 7) {
    return { text: toFixed(size, decimals, opts), suffix: ' day' };
  } else if (Math.abs(size) < 365) {
    return toFixedScaled(size / 7, decimals, scaledDecimals, 2, ' week', opts);
  } else {
    return toFixedScaled(size / 365, decimals, scaledDecimals, 3, ' year', opts);
  }
}

export const dateTimeAsIso = (value: number) => ({
  text: formatDateAsIso(value),
});
