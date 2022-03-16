// cSpell:ignore Quadr curusd curgbp cureur curbtc Datetime iops kibibytes kbytes mebibytes mbytes Milli gibibytes gbytes tebibytes tbytes petabits pebibytes pbytes decbits decbytes deckbytes decmbytes decgbytes dectbytes decpbytes Kbits Mbits Gbits Tbits Pbits datetimeiso reqps reqpm
import flatten from 'lodash/flatten';

import { toPercent, toPercentUnit } from './arithmeticFormatters';
import {
  dateTimeAsIso,
  toDays,
  toHours,
  toMicroSeconds,
  toMilliSeconds,
  toMinutes,
  toNanoSeconds,
  toSeconds,
} from './dateTimeFormatters';
import { binarySIPrefix, currency, decimalSIPrefix } from './symbolFormatters';
import { FormattedValue, scaledUnits, simpleCountUnit, ValueFormat, ValueFormatCategory } from './valueFormats';

export const NoneValueFormat: ValueFormat = { name: 'none', id: 'none', fn: (size: number) => ({ text: `${size}` }) };
export const ShortValueFormat: ValueFormat = {
  name: 'short',
  id: 'short',
  fn: scaledUnits(1000, ['', ' K', ' Mil', ' Bil', ' Tri', ' Quadr', ' Quint', ' Sext', ' Sept']),
};

/* eslint-disable  */
export const valueFormatCategories: ValueFormatCategory[] = [
  {
    name: 'Misc',
    formats: [
      NoneValueFormat,
      ShortValueFormat,
      { name: 'percent (0-100)', id: 'percent100', fn: toPercent },
      { name: 'percent (0.0-1.0)', id: 'percent', fn: toPercentUnit },
    ],
  },
  {
    name: 'Currency',
    formats: [
      { name: 'Dollars ($)', id: 'curusd', fn: currency('$') },
      { name: 'Pounds (£)', id: 'curgbp', fn: currency('£') },
      { name: 'Euro (€)', id: 'cureur', fn: currency('€') },
      { name: 'Bitcoin (฿)', id: 'curbtc', fn: currency('฿') },
    ],
  },
  {
    name: 'Data (IEC)',
    formats: [
      { name: 'bits(IEC)', id: 'bits', fn: binarySIPrefix('b') },
      { name: 'bytes(IEC)', id: 'bytes', fn: binarySIPrefix('B') },
      { name: 'kibibytes', id: 'kbytes', fn: binarySIPrefix('B', 1) },
      { name: 'mebibytes', id: 'mbytes', fn: binarySIPrefix('B', 2) },
      { name: 'gibibytes', id: 'gbytes', fn: binarySIPrefix('B', 3) },
      { name: 'tebibytes', id: 'tbytes', fn: binarySIPrefix('B', 4) },
      { name: 'pebibytes', id: 'pbytes', fn: binarySIPrefix('B', 5) },
    ],
  },
  {
    name: 'Data (Metric)',
    formats: [
      { name: 'bits(Metric)', id: 'decbits', fn: decimalSIPrefix('b') },
      { name: 'bytes(Metric)', id: 'decbytes', fn: decimalSIPrefix('B') },
      { name: 'kilobytes', id: 'deckbytes', fn: decimalSIPrefix('B', 1) },
      { name: 'megabytes', id: 'decmbytes', fn: decimalSIPrefix('B', 2) },
      { name: 'gigabytes', id: 'decgbytes', fn: decimalSIPrefix('B', 3) },
      { name: 'terabytes', id: 'dectbytes', fn: decimalSIPrefix('B', 4) },
      { name: 'petabytes', id: 'decpbytes', fn: decimalSIPrefix('B', 5) },
    ],
  },
  {
    name: 'Data Rate',
    formats: [
      { name: 'packets/sec', id: 'pps', fn: decimalSIPrefix('pps') },
      { name: 'bits/sec', id: 'bps', fn: decimalSIPrefix('bps') },
      { name: 'bytes/sec', id: 'Bps', fn: decimalSIPrefix('B/s') },
      { name: 'kilobytes/sec', id: 'KBs', fn: decimalSIPrefix('B/s', 1) },
      { name: 'kilobits/sec', id: 'Kbits', fn: decimalSIPrefix('bps', 1) },
      { name: 'megabytes/sec', id: 'MBs', fn: decimalSIPrefix('B/s', 2) },
      { name: 'megabits/sec', id: 'Mbits', fn: decimalSIPrefix('bps', 2) },
      { name: 'gigabytes/sec', id: 'GBs', fn: decimalSIPrefix('B/s', 3) },
      { name: 'gigabits/sec', id: 'Gbits', fn: decimalSIPrefix('bps', 3) },
      { name: 'terabytes/sec', id: 'TBs', fn: decimalSIPrefix('B/s', 4) },
      { name: 'terabits/sec', id: 'Tbits', fn: decimalSIPrefix('bps', 4) },
      { name: 'petabytes/sec', id: 'PBs', fn: decimalSIPrefix('B/s', 5) },
      { name: 'petabits/sec', id: 'Pbits', fn: decimalSIPrefix('bps', 5) },
    ],
  },
  {
    name: 'Datetime',
    formats: [{ name: 'YYYY-MM-DD HH:mm:ss', id: 'datetimeiso', fn: dateTimeAsIso }],
  },
  {
    name: 'Time',
    formats: [
      { name: 'Hertz (1/s)', id: 'hertz', fn: decimalSIPrefix('Hz') },
      { name: 'nanoseconds (ns)', id: 'ns', fn: toNanoSeconds },
      { name: 'microseconds (µs)', id: 'µs', fn: toMicroSeconds },
      { name: 'milliseconds (ms)', id: 'ms', fn: toMilliSeconds },
      { name: 'seconds (s)', id: 'secs', fn: toSeconds },
      { name: 'minutes (m)', id: 'mins', fn: toMinutes },
      { name: 'hours (h)', id: 'hours', fn: toHours },
      { name: 'days (d)', id: 'days', fn: toDays },
    ],
  },
  {
    name: 'Throughput',
    formats: [
      { name: 'counts/sec (cps)', id: 'cps', fn: simpleCountUnit('cps') },
      { name: 'ops/sec (ops)', id: 'ops', fn: simpleCountUnit('ops') },
      { name: 'requests/sec (rps)', id: 'reqps', fn: simpleCountUnit('reqps') },
      { name: 'reads/sec (rps)', id: 'rps', fn: simpleCountUnit('rps') },
      { name: 'writes/sec (wps)', id: 'wps', fn: simpleCountUnit('wps') },
      { name: 'I/O ops/sec (iops)', id: 'iops', fn: simpleCountUnit('iops') },
      { name: 'counts/min (cpm)', id: 'cpm', fn: simpleCountUnit('cpm') },
      { name: 'ops/min (opm)', id: 'opm', fn: simpleCountUnit('opm') },
      { name: 'requests/min (rps)', id: 'reqpm', fn: simpleCountUnit('reqpm') },
      { name: 'reads/min (rpm)', id: 'rpm', fn: simpleCountUnit('rpm') },
      { name: 'writes/min (wpm)', id: 'wpm', fn: simpleCountUnit('wpm') },
    ],
  },
];

export const valueFormats = flatten(valueFormatCategories.map((c) => c.formats));
export const getValueFormat = (id: string) => valueFormats.find((format) => format.id === id);
export const formattedValueToStr = ({ prefix, text, suffix }: FormattedValue) =>
  `${prefix || ''}${text || ''}${suffix || ''}`;
