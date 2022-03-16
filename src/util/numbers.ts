import isNumber from 'lodash/isNumber';

import { formattedValueToStr } from './units/units';
import { ValueFormatter } from './units/valueFormats';

export function isNumeric(value: any): boolean {
  return isNumber(value);
}

export const formatNumber = (
  num: number | null | undefined,
  valueFormatter?: ValueFormatter,
  opts?: Intl.NumberFormatOptions
): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '';
  }

  // Default mantissa.
  let mantissa: number = 3;

  // Handle special cases.
  if (num > -1 && num < 1) {
    // Small value so increase mantissa.
    mantissa = 4;
  } else if (num > Number.MAX_SAFE_INTEGER) {
    // Huge number, so no need for one.
    mantissa = 0;
  }

  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: mantissa,
    ...opts,
  };

  if (valueFormatter) {
    const fmt = Number(num.toFixed(mantissa)).toString(); // drop any zeros

    let decimals = 0;

    if (fmt.includes('.')) {
      decimals = fmt.length - fmt.indexOf('.') - 1;
    }

    return formattedValueToStr(valueFormatter(num, { decimals: decimals, skipScale: true }));
  }

  return new Intl.NumberFormat(undefined, options).format(num);
};
