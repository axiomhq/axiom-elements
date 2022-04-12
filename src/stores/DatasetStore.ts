// cSpell:ignore nocache Stdev uplot vfields vfield
/* eslint-disable no-array-constructor,@typescript-eslint/no-array-constructor */

////////////////////////////////////////////////////////////////////////////////////
// Brought over with minimal changes from `axiom` proper.
// Name of this file won't make sense in this project, but keeping it
// so it's easier to sync bug fixes later.
////////////////////////////////////////////////////////////////////////////////////

import Color from 'color-js/color';
import flatten from 'lodash/flatten';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import startCase from 'lodash/startCase';

import {
  Aggregation,
  APLRequestWithOptions,
  DatasetField,
  EntryGroup,
  EntryGroupAgg,
  Filter as ApiFilter,
  Interval,
  Order,
  QueryRequestWithOptions as ApiQueryRequestWithQueryOptions,
  Status,
  Timeseries,
} from '../types/codegenApiTypes';
import { generateColorContrast, generateColorLinear, THEMES } from '../util/color-schemes';
import { hashCode } from '../util/hashCode';
import { isNumeric } from '../util/numbers';
import { orderedStringify } from '../util/objects';
import { getValueFormat, ShortValueFormat } from '../util/units/units';
import { ValueFormatter } from '../util/units/valueFormats';

export const isAplQueryRequest = (
  request: APLRequestWithOptions | Partial<QueryRequest>
  // Changed this to use .hasOwnProperty so that empty strings on `apl` will still be understood as apl requests, albeit ones that might throw an error
): request is APLRequestWithOptions => Object.prototype.hasOwnProperty.call(request, 'apl');

export const isQueryRequest = (request: APLRequestWithOptions | Partial<QueryRequest>): request is QueryRequest =>
  !isAplQueryRequest(request);

// Function to pad the percentile with a 0 when necessary
export const formatPercentile = (percentile: number) => {
  let prettyPercentile = String(percentile);
  if (prettyPercentile.length === 1 || prettyPercentile.indexOf('.') === 1) {
    prettyPercentile = `0${prettyPercentile}`;
  }

  return `P${prettyPercentile.replace('.', '')}`;
};

export const formatAggregationChartTitle = (queryAgg: Aggregation) => {
  const { op, field, alias } = queryAgg;

  if (alias) {
    return alias;
  }

  const prettyOp = startCase(`${op}`);

  return field ? `${prettyOp}(${field})` : prettyOp;
};

export const isNumberType = (type?: string): boolean => {
  return (
    type !== undefined &&
    type.length > 0 &&
    type.split('|').filter((t) => t !== 'float' && t !== 'integer').length === 0
  );
};

export type Severity = 'info' | 'warn' | 'error';

export interface TotalInfo {
  id: string;
  group: { [key: string]: string };
  // First index corresponds to the index of the aggregation in the request, and the second to the primary or against query result data
  aggs: (EntryGroupAgg | undefined)[][];
}

// Information for visualizing
export interface AggregationSummary {
  aggregation: Aggregation;
}

export interface SpectrographTotalValues {
  count: number;
  from: number;
  to: number;
}

export interface SpectrographSummary extends AggregationSummary {
  colorScales: ColorScale[];
  defaultColor: string;
  groupsToValues: { [group: string]: undefined | (null | SpectrographTotalValues[])[] }; // any Matches EntryGroupAgg.value
}

export type NumberData = number[];
export type NumberOrNullData = (number | null)[];

export interface Series {
  name: string;
  data: NumberData;
}

export interface LineSeries extends Omit<Series, 'data'> {
  color: string;
  dashed: boolean;
  data: NumberOrNullData;
}

export interface BarSeries extends Series {
  color: string;
}

export enum AggregationChartType {
  Percentiles = 'Percentiles',
  HeatMap = 'HeatMap',
  Line = 'Line',
  Topk = 'Topk',
}

export interface AggregationChartInfo extends AggregationSummary {
  id: string;
  type: AggregationChartType;
  empty: boolean;
  title: string;
  alerts?: string[];
}

export interface LineChartInfo extends AggregationChartInfo {
  times: number[];
  series: LineSeries[];
  againstSeries: LineSeries[];
  min?: number;
  max?: number;
}

export interface Bucket {
  from: number;
  to: number;
}
export type TopkValue = { key: string; count: number; error: number };
export type KeyCountValues = {
  key: string;
  // The array allows for merging multiple query data
  count: (number | null)[];
};

export interface TopkChartInfo extends AggregationChartInfo {
  groups: string[]; // Order of groups to render data
  groupKeyToGroup: { [groupKey: string]: { [field: string]: any } };
  groupColors: { [key: number]: string };
  groupValues: {
    [groupKey: string]: undefined | KeyCountValues[];
  };
  hasAgainst: boolean;
  hasGroups: boolean;
  maxCountValue: number;
}

export interface PercentilesChartInfo extends AggregationChartInfo {
  bars: BarSeries[];
  lines: LineSeries[];
  max: number;
  times: number[];
}

export interface ColorScale {
  from: number;
  to: number;
  color: string;
  name: string;
}

export interface HeatMapChartInfo extends AggregationChartInfo {
  groupColorScales: { [groupKey: string]: ColorScale[] | undefined };
  groupSeries: { [groupKey: string]: number[][] | undefined }; // Actual data per interval
  groupMeta: { [groupKey: string]: { min: number; max: number } | undefined };
  labels: number[];
  buckets: (Bucket | undefined)[];
}

export interface ComputedQueryResults {
  queryAggs: Aggregation[];
  aggregationCharts: AggregationChartInfo[];
  aggregationSummaries: AggregationSummary[];
  colors: ChartColors;
  datasetId?: string;
  endTime: string;
  groups: string[];
  id: string;
  hasResults: boolean;
  lastRun: Date;
  matches: EntryRow[];
  order?: Order;
  resolution: string;
  startTime: string;
  status: Status;
  totals: TotalInfo[];
  queryOptions?: { [key: string]: any };
  fieldValueFormatters?: FieldValueFormatters;
}

export interface EntryRow {
  _rowId: string;
  _time: string;
  data: { [key: string]: any };
  // Prioritized keys for display
  dataKeys: string[];
  severity: Severity;
}

export interface QueryResult {
  buckets: Timeseries;
  datasetId?: string;
  matches: EntryRow[];
  status: Status;
  query: QueryRequest;
  fieldsMeta?: Array<DatasetField>;
}

export interface Filter extends Omit<ApiFilter, 'op' | 'children'> {
  op: Filter.OpEnum;
  children?: Filter[];
}

export interface QueryRequest extends Omit<ApiQueryRequestWithQueryOptions, 'filter'> {
  filter?: Filter;
}

export type QueryRequestType = 'query' | 'apl';

export type ChartColors = { [key: string]: { light: string; dark: string } };

export interface FieldValueFormatters {
  [fieldName: string]: ValueFormatter | undefined;
}

export interface DatasetFieldValueFormatters {
  [datasetName: string]: FieldValueFormatters | undefined;
}

//////////////////////////////////////////////////////////////////
// computeResults is the main entry point
//////////////////////////////////////////////////////////////////

export function computeResults(
  result?: QueryResult,
  againstResult?: QueryResult,
  uid: string = '1',
  additionalQueryOptions?: { [key: string]: any },
  queryHash?: number
): ComputedQueryResults | undefined {
  const results: QueryResult[] = [];

  if (result) {
    results.push(result);

    if (againstResult) {
      results.push(againstResult);
    }
  }

  return computeQueryResults(results, new Date(), uid, additionalQueryOptions, queryHash);
}

export function formatAggregationHeader(queryAgg: Aggregation) {
  const { field, op, alias } = queryAgg;

  if (alias) {
    return alias;
  }

  const prettyOp = `${op}`.toUpperCase();

  return field ? `${prettyOp}(${field})` : prettyOp;
}

export function fieldsMetaToFieldValueFormatters(fieldsMeta: DatasetField[] | undefined) {
  let fieldValueFormatters: FieldValueFormatters | undefined;

  fieldsMeta?.forEach((field) => {
    if (!fieldValueFormatters) {
      fieldValueFormatters = {};
    }

    const { name, type, unit } = field;

    if (isNumberType(type)) {
      fieldValueFormatters[name] = getValueFormat(unit)?.fn || ShortValueFormat.fn; // ShortValueFormat is the default for numbers
    }
  });

  return fieldValueFormatters;
}

function computeQueryResults(
  results: QueryResult[], // NOTE: this is an array of QueryResult. It contains the primary query and if specified the "against query".
  lastRun: Date,
  uid: string,
  additionalQueryOptions?: { [key: string]: any },
  // fieldValueFormatters?: FieldValueFormatters,
  queryHash?: number
): ComputedQueryResults | undefined {
  if (!results.length) {
    return undefined;
  }

  let queryAggs: Aggregation[] = [];
  let resolution: string = '';
  let groupBy: string[] | undefined;

  const query = results[0].query;

  const { endTime, startTime } = query;

  if (!isAplQueryRequest(query)) {
    queryAggs = query.aggregations || queryAggs;
    resolution = query.resolution;
    groupBy = query.groupBy;
  }

  const allQueryResultsTotals = results.map((r) => r.buckets.totals ?? []);
  const allQueryResultsSeries = results.map((r) => r.buckets.series ?? []);

  const rows = getTotalsRows(allQueryResultsTotals, queryAggs, groupBy);
  const topGroups = getTopResultsGroups(results, groupBy);

  // Pass queryHash as hash code for the empty group so there's color variation but continuity across page loads
  const colors = calculateColors(topGroups, queryHash);

  const queryOptions = {
    ...query.queryOptions,
    ...additionalQueryOptions,
  };

  const { charts, summaries } = calculateVisualizations(
    allQueryResultsTotals,
    allQueryResultsSeries,
    colors,
    queryAggs,
    groupBy,
    queryOptions
  );

  const matches = results[0].matches;

  const fieldValueFormatters: FieldValueFormatters = {};

  results.forEach((result) => {
    Object.assign(fieldValueFormatters, fieldsMetaToFieldValueFormatters(result.fieldsMeta));
  });

  return {
    queryAggs: queryAggs,
    aggregationCharts: charts,
    aggregationSummaries: summaries,
    datasetId: results[0].datasetId,
    endTime: endTime,
    colors: colors,
    id: uid,
    hasResults: charts.find((chart) => !chart.empty) !== undefined || matches.length > 0 || rows.length > 0,
    totals: rows,
    groups: groupBy || [],
    matches: matches,
    order: undefined, // FIX: set the order properly
    resolution: resolution,
    startTime: startTime,
    status: results[0].status,
    lastRun: lastRun,
    queryOptions: queryOptions,
    fieldValueFormatters: fieldValueFormatters,
  };
}

function getEntryGroupKey(
  group: EntryGroup,
  // not using ? for arg to ensure query groupBy is passed
  groupBy: string[] | undefined
) {
  const sortedKeys = groupBy ? groupBy : Object.keys(group.group).sort();

  return sortedKeys
    .map((key) => group.group[key])
    .map((value) => (typeof value === 'string' || typeof value === 'number' ? value : orderedStringify(value)))
    .join(', '); // An empty string can be a key
}

function getTopResultsGroups(results: QueryResult[], groupBy?: string[]): string[] {
  // FIX: this is pretty naive and I'm sure there's a better way to choose what groups are "top"
  return (
    flatten(
      results
        .filter((r) => r.buckets.totals) // FIX: remove when the backend is fixed
        .map((r) =>
          (r.buckets.totals ?? [])
            // Only want to color or graph the top N groups from each result totals
            .slice(0, 25)
        )
    )
      // Generate the key
      .map((entryGroup) => getEntryGroupKey(entryGroup, groupBy))
  );
}

function calculateColors(groupKeys: string[], emptyGroupHash?: number): ChartColors {
  const theme: string[] = [
    '#00783e', // green-dark
    // '#47b881', // green-base
    '#14b5d0', // teal-base
    // '#007489', // teal-dark
    '#1070ca', // blue-base
    // '#084b8a', // blue-dark
    '#735dd0', // purple-base
    '#ec4c47', // red-base
    // '#bf0e08', // red-dark
    '#d9822b', // orange-base
    // '#95591e', // orange-dark
    '#f7d154', // yellow-base
  ];

  const lightTheme: string[] = [
    '#e4f6ec', // backgrounds-green
    '#e8f8fa', // backgrounds-teal
    '#dbeaf7', // blue-light. Not using backgrounds-blue here because that color is also used for highlighting rows #2205
    '#eceaf9', // backgrounds-purple
    '#fdeaea', // backgrounds-red
    '#faeada', // backgrounds-orange
    '#fef8e7', // backgrounds-yellow
  ];

  const colors: ChartColors = {};
  const colorList: string[] = [];
  const lightColorList: string[] = [];

  // Generate a large color space
  const NUM_COLORS = Math.max(60, groupKeys.length * 3);
  for (let i = 0; i < NUM_COLORS; i += 1) {
    colorList.push(generateColorContrast(theme, i).toCSS());
    lightColorList.push(generateColorContrast(lightTheme, i).toCSS());
  }

  // Add a color for no group/empty string
  const emptyCode = typeof emptyGroupHash === 'number' ? emptyGroupHash : hashCode('');
  const emptyIdx = emptyCode % NUM_COLORS;
  colors[''] = { dark: colorList[emptyIdx], light: lightColorList[emptyIdx] };

  for (let i = 0; i < groupKeys.length; i += 1) {
    const key = groupKeys[i];
    if (!colors[key]) {
      const code = hashCode(key);
      const idx = code % NUM_COLORS;
      colors[key] = { dark: colorList[idx], light: lightColorList[idx] };
    }
  }

  return colors;
}

/**
 * Calculate a data structure that can be rendered by a table where a row represents a group and aggregation cells display values from multiple queries
 */
function getTotalsRows(lagTotals: EntryGroup[][], queryAggs: Aggregation[], groupBy: string[] | undefined) {
  // This will hold the aggregation totals values over time, e.g. { count: <info about 'count' totals over multiple queries>}
  const totalsAcrossQueries: { [key: string]: TotalInfo } = {};

  // Sets to build up table columns based on response data
  const aggregationSet = {};

  // Rows
  const rows: TotalInfo[] = [];

  let entryGroups: EntryGroup[] = [];
  let entryGroup: EntryGroup;
  let agg: EntryGroupAgg;
  for (let totalsIdx = 0; totalsIdx < lagTotals.length; totalsIdx += 1) {
    entryGroups = lagTotals[totalsIdx];

    for (let entryGroupIdx = 0; entryGroupIdx < entryGroups.length; entryGroupIdx += 1) {
      entryGroup = entryGroups[entryGroupIdx];

      // Key to retrieve or create list to hold row values which may not be present in all queries
      const key = getEntryGroupKey(entryGroup, groupBy);

      // Get or create the structure to hold the row info
      let row = totalsAcrossQueries[key];
      if (!row) {
        // Convert group values, which are `any` and could be objects, to strings
        const stringifiedGroup = Object.keys(entryGroup.group).reduce((accum, k) => {
          let val = entryGroup.group[k];

          if (typeof val !== 'string' && typeof val !== 'number') {
            val = JSON.stringify(entryGroup.group[k]);
          }

          accum[k] = val;

          return accum;
        }, {});

        // 'aggs' can be keyed by the 'aggregations' index in the original query
        row = { id: key, aggs: new Array(queryAggs.length).fill(null), group: stringifiedGroup };
        totalsAcrossQueries[key] = row;
        rows.push(row);
      }

      // Iterate over actual totals values
      const aggregations = entryGroup.aggregations ?? [];
      for (let aggIdx = 0; aggIdx < aggregations.length; aggIdx += 1) {
        // entryGroup.aggregations.forEach((agg) => {
        agg = aggregations[aggIdx];
        // Add any column headers
        aggregationSet[agg.op] = true;

        let values = row.aggs[aggIdx];

        if (!values) {
          values = new Array(lagTotals.length).fill(null); // Create a list as long as num of queries passed in
          row.aggs[aggIdx] = values;
        }

        // Adding value at this lag's index so it's aligned properly in the table cell
        values[totalsIdx] = agg;
      }
    }
  }

  return rows;
}

// Function to create a number of buckets given a starting and ending value. Used
// to assign properties such as a color to a range of values.
const makeBuckets = (low: number, high: number, count: number) => {
  const step = (high - low) / count;

  const buckets: any[] = [];

  for (let i = 0; i < count; i += 1) {
    buckets.push({ from: low + i * step, to: i === count - 1 ? high : low + (i + 1) * step });
  }

  return buckets;
};

const MAX_COLOR_SCALE_BUCKETS = 7;

// Function to create color options for the heat map chart (and other instances where a color
// is applied to a range of values).
const makeColorScales = (min: number | undefined, max: number | undefined, colorTheme: string[]) => {
  const buckets = [
    // Special empty bucket that renders a white square for 0 values
    // It has an empty name so that it isn't visible in the legend
    {
      from: 0,
      to: 0,
      color: '#FFFFFF',
      name: ' ',
    },
  ];

  if (min !== undefined && max !== undefined && max >= min) {
    const numBuckets = max - min > MAX_COLOR_SCALE_BUCKETS ? MAX_COLOR_SCALE_BUCKETS : max - min;
    if (numBuckets > 2) {
      buckets.push(
        ...makeBuckets(min, max, numBuckets).map((item, i) => ({
          ...item,
          color: generateColorLinear(colorTheme, i, numBuckets).toCSS(),
          name: new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(item.to),
        }))
      );
    } else {
      // Handle case where min and max are the same or there's only one bucket
      buckets.push({
        from: max,
        to: max,

        color: generateColorLinear(
          colorTheme,
          1, // Arbitrarily use a low intensity color since there is only one bucket
          MAX_COLOR_SCALE_BUCKETS
        ).toCSS(),
        name: new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(max),
      });
    }
  }

  return buckets;
};

// Accumulates data while iterating over a set of data
interface Accumulator {
  empty: boolean;
}

// Accumulates data used to create a Spectrograph
interface SpectrographAccumulator extends Accumulator {
  min: number | undefined;
  max: number | undefined;
  groupsToValues: { [group: string]: undefined | (null | any[])[] }; // any Matches EntryGroupAgg.value
}

// Accumulates data used to create a HeatMap
interface HeatMapAccumulator extends Accumulator {
  labels: number[];
  buckets: ({ from: number; to: number } | undefined)[];
  groupSeries: { [key: string]: number[][] | undefined };
  groupMeta: { [groupKey: string]: { min: number; max: number } | undefined };
  alerts?: string[];
}

// Accumulates data used to create a line chart
interface LineChartAccumulator extends Accumulator {
  times: number[];
  seriesData: { [key: string]: (number | null)[][] };
  min?: number;
  max?: number;
}

interface PercentilesAccumulator extends Accumulator {
  max?: number;
  seriesData: number[][][];
  times: number[];
}

// General params that will be passed to a function when iterating over the totals
interface TotalsParams {
  accumulator?: Accumulator;
  queryAgg: Aggregation;
  aggIdx: number;
  entryGroup: EntryGroup;
  graphedGroupColors: ChartColors;
  queryCount: number;
  queryIdx: number;
  value: any;
  groupBy?: string[];
}

// Params passed to a function that processes accumulated data from totals
interface TotalsResultParams {
  accumulator: Accumulator;
  queryAgg: Aggregation;
  aggIdx: number;
  queryCount: number;
  summaries: AggregationSummary[];
  charts: AggregationChartInfo[];
  groupBy?: string[];
  intervalCount: number;
}

// General params that will be passed to a function when iterating over the intervals
interface IntervalsParams {
  accumulator?: Accumulator;
  queryAgg: Aggregation;
  aggIdx: number;
  graphedGroupColors: ChartColors;
  interval: Interval;
  queryCount: number;
  queryIdx: number;
  queryOptions?: { [key: string]: string };
  intervalIdx: number;
  intervalCount: number;
  groupBy?: string[];
}

// Params passed to a function that processes accumulated data from intervals
interface IntervalsResultParams {
  accumulator?: Accumulator;
  queryAgg: Aggregation;
  charts: AggregationChartInfo[];
  graphedGroupColors: ChartColors;
  intervalCount: number;
}

interface TopkChartAccumulator extends Accumulator {
  groups: string[]; // Order of groups to render data
  groupKeyToGroup: { [groupKey: string]: { [field: string]: any } };
  groupColors: { [key: number]: string };
  groupValues: {
    [groupKey: string]: undefined | KeyCountValues[];
  };
  // Track the max value for charting bars
  maxCountValue: number;
}

interface GroupedPercentilesAccumulator extends Accumulator {
  times: number[];
  pSeriesData: { [key: string]: (number | null)[][] }[];
  min?: number;
  max?: number;
}

// Function that will be called on each iteration over the totals
type TotalsFunction = (params: TotalsParams) => Accumulator;

// Function that will be called after all the totals have been iterated over
type TotalsResultFunction = (params: TotalsResultParams) => void;

// Function that will be called on each iteration over the intervals
type IntervalsFunction = (params: IntervalsParams) => Accumulator | undefined;

// Function that will be called after all the intervals have been iterated over
type IntervalsResultFunction = (params: IntervalsResultParams) => void;

const MAX_HEATMAP_BUCKETS = 50;

// Function to append an iteration's data to an overall accumulator of data
function accumulateSpectrograph(params: TotalsParams): SpectrographAccumulator {
  const { value, entryGroup, queryCount, groupBy } = params;
  const accumulator: SpectrographAccumulator = params.accumulator
    ? (params.accumulator as SpectrographAccumulator)
    : { min: undefined, max: undefined, empty: true, groupsToValues: {} };

  if (value) {
    const trimmedValue = value.slice(0, MAX_HEATMAP_BUCKETS);

    const { groupsToValues } = accumulator;
    const groupKey = getEntryGroupKey(entryGroup, groupBy);

    if (!groupsToValues[groupKey]) {
      groupsToValues[groupKey] = new Array(queryCount).fill(null);
    }

    groupsToValues[groupKey]![params.queryIdx] = trimmedValue; // Using ! because the instantiation happens above

    // Track whether the chart is no longer empty
    accumulator.empty = false;

    trimmedValue.forEach(({ count }: { count: number }) => {
      accumulator.min =
        count !== 0 && (accumulator.min === undefined || accumulator.min > count) ? count : accumulator.min;
      accumulator.max =
        count !== 0 && (accumulator.max === undefined || accumulator.max < count) ? count : accumulator.max;
    });
  }

  return accumulator;
}

// Function to transform an accumulation of Spectrograph data to be used in the Totals table
function summarizeSpectrograph({ accumulator, summaries, aggIdx, queryAgg }: TotalsResultParams) {
  const { min, max, groupsToValues } = accumulator as SpectrographAccumulator;

  const specSummary: SpectrographSummary = {
    colorScales: makeColorScales(min, max, THEMES.BlueToPurple),
    defaultColor: THEMES.BlueToPurple[THEMES.BlueToPurple.length - 1],
    groupsToValues: groupsToValues,
    aggregation: queryAgg,
  };

  summaries[aggIdx] = specSummary;
}

function accumulateHeatMap(params: IntervalsParams): HeatMapAccumulator | undefined {
  const { aggIdx, interval, intervalCount, intervalIdx, queryAgg, queryIdx, groupBy } = params;

  if (typeof queryAgg.argument !== 'number') {
    return undefined;
  }
  const bucketCount = Math.min(queryAgg.argument as number, MAX_HEATMAP_BUCKETS);

  // For all intervals make an [] of N histogram buckets
  const makeSeries = (count: number) => new Array(intervalCount).fill(null).map(() => new Array(count).fill(0));

  const accumulator: HeatMapAccumulator = params.accumulator
    ? (params.accumulator as HeatMapAccumulator)
    : {
        groupSeries: {
          '': makeSeries(bucketCount),
        },
        groupMeta: {},
        labels: [],
        buckets: [],
        empty: true,
        alerts:
          bucketCount === queryAgg.argument
            ? undefined
            : [
                `${formatAggregationChartTitle(queryAgg)} is shown with only ${
                  bucketCount === 1 ? 'one bucket' : 'buckets'
                }.`,
              ],
      };

  const { groupSeries, groupMeta, labels } = accumulator;

  // Store the interval time for the primary query
  if (queryIdx === 0) {
    labels.push(new Date(interval.startTime).getTime());

    if (interval.groups) {
      interval.groups.forEach((g) => {
        const entryGroupKey = getEntryGroupKey(g, groupBy);

        const matchedAgg = (g.aggregations || [])[aggIdx];

        if (matchedAgg) {
          // Track whether the chart is no longer empty
          accumulator.empty = false;

          // A helper function to process the bucket value since we repeat the process for the group and the special "all" group
          const processBucketValue = (groupKey: string, intervalValue: any, bucketPos: number) => {
            const series = groupSeries[groupKey] || makeSeries(bucketCount);
            groupSeries[groupKey] = series;

            const { count } = intervalValue;

            // Here we are setting or adding the value in case we're processing the bucket for the "all" group
            let value = series[intervalIdx][bucketPos];
            value += count as number;
            series[intervalIdx][bucketPos] = value;

            // meta tracks the min and max over the data
            let meta = groupMeta[groupKey];
            if (!meta) {
              meta = { min: value, max: value };
              groupMeta[groupKey] = meta;
            }

            // We don't want to have any min/max be 0 because those will be filled with an empty color
            meta.min = value !== 0 && meta.min > value ? value : meta.min;
            meta.max = value !== 0 && meta.max < value ? value : meta.max;
          };

          matchedAgg.value.forEach((intervalBucketValue: any, bucketPos: number) => {
            if (bucketPos >= bucketCount) {
              return;
            }
            processBucketValue(entryGroupKey, intervalBucketValue, bucketPos);
            // Do the same for the special "all" group
            // entryGroupKey will be '' if there is no grouping so need to skip in that case
            if (entryGroupKey !== '') {
              processBucketValue('', intervalBucketValue, bucketPos);
            }
          });

          // We need access to the bucket to/from values later on
          if (!accumulator.buckets.length) {
            accumulator.buckets = [...matchedAgg.value].slice(0, bucketCount);
          }
        }
      });
    }
  }

  return accumulator;
}

function chartHeatMap({ accumulator, queryAgg, charts, intervalCount }: IntervalsResultParams) {
  const { groupSeries, groupMeta, labels, buckets, empty, alerts } = accumulator as HeatMapAccumulator;

  // Calculate the color scales for each group using meta data
  const colorScales: { [key: string]: ColorScale[] } = Object.keys(groupMeta).reduce((accum, groupKey) => {
    const meta = groupMeta[groupKey];

    if (meta) {
      accum[groupKey] = makeColorScales(meta.min, meta.max, THEMES.BlueToPurple);
    }

    return accum;
  }, {});

  const chartInfo: HeatMapChartInfo = {
    id: JSON.stringify(queryAgg),
    aggregation: queryAgg,
    groupSeries: groupSeries,
    groupMeta: groupMeta,
    type: AggregationChartType.HeatMap,
    groupColorScales: colorScales,
    labels: labels,
    buckets: buckets,
    empty: empty || intervalCount < 2, // charts with one interval are considered empty
    title: formatAggregationChartTitle(queryAgg),
    alerts: alerts,
  };

  charts.push(chartInfo);
}

function accumulateLineChart(params: IntervalsParams): LineChartAccumulator | undefined {
  const {
    queryAgg,
    aggIdx,
    interval,
    intervalCount,
    intervalIdx,
    graphedGroupColors,
    queryOptions,
    queryCount,
    queryIdx,
    groupBy,
  } = params;

  const displayNull = queryOptions?.displayNull;

  const accumulator: LineChartAccumulator = params.accumulator
    ? (params.accumulator as LineChartAccumulator)
    : {
        seriesData: {},
        times: [],
        empty: true,
        min: undefined,
        max: undefined,
      };

  const { times, seriesData } = accumulator;

  // Store the interval time for the primary query
  if (queryIdx === 0) {
    times.push(new Date(interval.startTime).getTime());
  }

  interval.groups?.forEach((entryGroup) => {
    const agg = (entryGroup.aggregations || [])[aggIdx];
    if (agg) {
      // Track whether the chart is no longer empty
      if (agg.value !== null && agg.value !== undefined) {
        accumulator.empty = false;
      }

      const groupKey = getEntryGroupKey(entryGroup, groupBy);
      if (!graphedGroupColors[groupKey]) {
        // Group should not be graphed
        return;
      }

      // Replace nulls depending on the aggregation op and how nulls should be displayed
      let emptyValue: null | 0 = null;

      if (
        displayNull === 'auto' &&
        (queryAgg.op === Aggregation.OpEnum.Count || queryAgg.op === Aggregation.OpEnum.Distinct)
      ) {
        emptyValue = 0;
      } else if (displayNull === 'zero') {
        emptyValue = 0;
      }

      if (!seriesData[groupKey]) {
        seriesData[groupKey] = new Array(queryCount).fill(null).map(() => new Array(intervalCount).fill(emptyValue));
      }

      const { value } = agg;

      if (isNumeric(value)) {
        seriesData[groupKey][queryIdx][intervalIdx] = value;
        accumulator.min = accumulator.min === undefined ? value : Math.min(accumulator.min, value);
        accumulator.max = accumulator.max === undefined ? value : Math.max(accumulator.max, value);
      } else {
        seriesData[groupKey][queryIdx][intervalIdx] = emptyValue;
      }
    }
  });

  return accumulator;
}

function chartLineChart({ accumulator, queryAgg, charts, graphedGroupColors, intervalCount }: IntervalsResultParams) {
  if (!accumulator) {
    return;
  }

  const { seriesData, times, empty, min, max } = accumulator as LineChartAccumulator;

  const series: LineSeries[] = [];
  const againstSeries: LineSeries[] = [];

  Object.keys(seriesData).forEach((groupKey) => {
    seriesData[groupKey].forEach((data, queryIdx) => {
      const line: LineSeries = {
        name: groupKey,
        data: data,
        color: graphedGroupColors[groupKey]?.dark,
        dashed: queryIdx !== 0, // lag queries are dashed
      };

      if (queryIdx === 0) {
        series.push(line);
      } else {
        againstSeries.push(line);
      }
    });
  });

  const chartInfo: LineChartInfo = {
    aggregation: queryAgg,
    id: JSON.stringify(queryAgg),
    series: series,
    againstSeries: againstSeries,
    times: times,
    type: AggregationChartType.Line,
    empty: empty || intervalCount < 2, // charts with one interval are considered empty
    title: formatAggregationChartTitle(queryAgg),
    min: min,
    max: max,
  };

  charts.push(chartInfo);
}

function accumulatePercentiles(params: IntervalsParams): PercentilesAccumulator | undefined {
  const { queryAgg, aggIdx, interval, intervalCount, intervalIdx, queryCount, queryIdx } = params;

  const { argument } = queryAgg;

  // Expect the argument to be an array of percentiles
  if (!(argument && Array.isArray(argument) && argument.length)) {
    return undefined;
  }

  const accumulator: PercentilesAccumulator = params.accumulator
    ? (params.accumulator as PercentilesAccumulator)
    : {
        seriesData:
          // Separate series data for each query
          new Array(queryCount)
            .fill(null)
            // Add series for each percentile
            .map(() =>
              new Array(argument.length)
                .fill(null)
                // Add space each interval
                .map(() => new Array(intervalCount).fill(null))
            ),
        times: [],
        max: undefined,
        empty: true,
      };

  const { times, seriesData } = accumulator;

  // Store the interval time for the primary query
  if (queryIdx === 0) {
    times.push(new Date(interval.startTime).getTime());
  }

  // There should only be one group
  if (interval.groups?.length) {
    const agg = (interval.groups[0].aggregations || [])[aggIdx];
    if (agg && agg.value !== null && agg.value !== undefined) {
      const values = Array.isArray(agg.value) ? agg.value : [agg.value];
      // Track whether the chart is no longer empty
      accumulator.empty = false;

      values.forEach((value: number, percentileIdx) => {
        seriesData[queryIdx][percentileIdx][intervalIdx] = value;

        accumulator.max = accumulator.max === undefined ? value : Math.max(accumulator.max, value);
      });
    }
  }

  return accumulator;
}

function chartPercentiles({ accumulator, queryAgg, charts, intervalCount }: IntervalsResultParams) {
  if (!accumulator) {
    return;
  }

  const { max, seriesData, times, empty } = accumulator as PercentilesAccumulator;

  const chartInfo: PercentilesChartInfo = {
    aggregation: queryAgg,
    bars: [],
    id: JSON.stringify(queryAgg),
    lines: [],
    max: max === undefined ? 0 : max,
    times: times,
    type: AggregationChartType.Percentiles,
    empty: empty || intervalCount < 2, // charts with one interval are considered empty
    title: formatAggregationChartTitle(queryAgg),
  };

  charts.push(chartInfo);

  seriesData.forEach((percentiles, queryIdx) => {
    percentiles.forEach((percentileData, argumentIdx) => {
      const color = generateColorContrast(THEMES.Purple, argumentIdx).toCSS();
      const name = formatPercentile(queryAgg.argument[argumentIdx]);

      // The primary query is rendered as bars and the others as lines
      if (queryIdx === 0) {
        // Bars are stacked so they need to be draw in reverse order (back to front)
        chartInfo.bars.unshift({ name: name, color: color, data: percentileData });
      } else {
        let againstColor = Color(color);
        againstColor = againstColor.lightenByRatio(0.3);

        chartInfo.lines.push({
          name: name,
          color: againstColor.toCSS(),
          data: percentileData,
          dashed: true,
        });
      }
    });
  });
}

function accumulateTopkChart(params: TotalsParams): TopkChartAccumulator {
  const { value, entryGroup, graphedGroupColors, queryIdx, queryCount, groupBy } = params;
  const accumulator: TopkChartAccumulator = params.accumulator
    ? (params.accumulator as TopkChartAccumulator)
    : { groups: [], groupValues: {}, groupColors: {}, empty: true, maxCountValue: 0, groupKeyToGroup: {} };

  if (Array.isArray(value)) {
    const { groups, groupColors, groupValues, groupKeyToGroup } = accumulator;
    const groupKey = getEntryGroupKey(entryGroup, groupBy);

    // Group might already be in the list since we're iterating over multiple query responses
    if (!groups.includes(groupKey)) {
      groups.push(groupKey);
      groupKeyToGroup[groupKey] = entryGroup.group;
    }

    groupColors[groupKey] = graphedGroupColors[groupKey]?.light || '#f0f2f5'; // backgrounds-darker

    const topkValues = value as TopkValue[];

    // Initialize a place for the values if there isn't one
    if (!groupValues[groupKey]) {
      groupValues[groupKey] = [];
    }

    const thisGroupValues_ = groupValues[groupKey];

    if (thisGroupValues_) {
      const thisGroupValues = thisGroupValues_; // Setting to a new variable because otherwise thisGroupValues_ type can be undefined within the function calls below

      topkValues.forEach(({ key, count, error }) => {
        let keyValues = thisGroupValues.find((keyCounts) => keyCounts.key === key);

        if (!keyValues) {
          keyValues = { key: key, count: new Array(queryCount).fill(null) };
          thisGroupValues.push(keyValues);
        }

        if (keyValues) {
          // FUTURE: remove if backend provides the correct count.
          // Fix count value by subtracting error. Doing this on the frontend is a stopgap.
          // See: https://github.com/axiomhq/axiom/axiomdb/issues/2029
          const adjustedCount = count - error;

          keyValues.count[queryIdx] = adjustedCount;

          accumulator.maxCountValue = Math.max(accumulator.maxCountValue, adjustedCount);

          // Track whether the chart is no longer empty
          accumulator.empty = false;
        }
      });
    }
  }

  return accumulator;
}

function chartTopkChart({ accumulator, queryAgg, charts, queryCount, groupBy, intervalCount }: TotalsResultParams) {
  if (!accumulator) {
    return;
  }

  const { groups, groupColors, groupValues, empty, maxCountValue, groupKeyToGroup } =
    accumulator as TopkChartAccumulator;

  Object.keys(groupValues).forEach((group) => {
    groupValues[group]?.sort((a, b) => {
      // Get rid of nulls
      const aCounts = a.count.map((count) => count || 0);
      const bCounts = b.count.map((count) => count || 0);

      return Math.max(...bCounts) - Math.max(...aCounts);
    });
  });

  const chartInfo: TopkChartInfo = {
    id: JSON.stringify(queryAgg),
    aggregation: queryAgg,
    type: AggregationChartType.Topk,
    groupValues: groupValues,
    groupColors: groupColors,
    groups: groups,
    groupKeyToGroup: groupKeyToGroup,
    empty: empty || intervalCount < 2, // charts with one interval are considered empty
    // This chart needs to have first-hand knowledge that an against query was performed
    hasAgainst: queryCount > 1,
    hasGroups: !!groupBy?.length,
    maxCountValue: maxCountValue,
    title: formatAggregationChartTitle(queryAgg),
  };

  charts.push(chartInfo);
}

function accumulateGroupedPercentiles(params: IntervalsParams): any | undefined {
  const {
    queryAgg,
    aggIdx,
    interval,
    intervalCount,
    intervalIdx,
    queryCount,
    queryIdx,
    graphedGroupColors,
    queryOptions,
    groupBy,
  } = params;

  const { argument } = queryAgg;

  // Expect the argument to be an array of percentiles
  if (!(argument && Array.isArray(argument) && argument.length)) {
    return undefined;
  }

  const accumulator: GroupedPercentilesAccumulator = params.accumulator
    ? (params.accumulator as GroupedPercentilesAccumulator)
    : {
        pSeriesData: new Array(
          // One for each percentile requested, e.g. 95, 99, 995
          argument.length
        )
          .fill(null)
          .map(() => ({})),
        times: [],
        empty: true,
        min: undefined,
        max: undefined,
      };

  const { times, pSeriesData } = accumulator;

  // Store the interval time for the primary query
  if (queryIdx === 0) {
    times.push(new Date(interval.startTime).getTime());
  }

  // Replace nulls depending on how nulls should be displayed
  const emptyValue = queryOptions?.displayNull === 'zero' ? 0 : null;

  interval.groups?.forEach((entryGroup) => {
    const agg = (entryGroup.aggregations || [])[aggIdx];
    if (agg && agg.value !== undefined && agg.value !== null) {
      const values = Array.isArray(agg.value) ? agg.value : [agg.value];
      // Track whether the chart is no longer empty
      accumulator.empty = false;

      const key = getEntryGroupKey(entryGroup, groupBy);
      if (!graphedGroupColors[key]) {
        // Group should not be graphed
        return;
      }

      values.forEach((numValue: number, pIdx) => {
        if (!pSeriesData[pIdx][key]) {
          pSeriesData[pIdx][key] = new Array(queryCount)
            .fill(null)
            .map(() => new Array(intervalCount).fill(emptyValue));
        }

        const value = numValue;

        pSeriesData[pIdx][key][queryIdx][intervalIdx] = value;

        accumulator.min = accumulator.min === undefined ? value : Math.min(accumulator.min, value);
        accumulator.max = accumulator.max === undefined ? value : Math.max(accumulator.max, value);
      });
    }
  });

  return accumulator;
}

function chartGroupedPercentiles({
  accumulator,
  queryAgg,
  charts,
  graphedGroupColors,
  intervalCount,
}: IntervalsResultParams) {
  if (!accumulator) {
    return;
  }

  const { pSeriesData, times, empty, min, max } = accumulator as GroupedPercentilesAccumulator;

  pSeriesData.forEach((seriesData, pIdx: number) => {
    const series: LineSeries[] = [];
    const againstSeries: LineSeries[] = [];

    Object.keys(seriesData).forEach((key) => {
      seriesData[key].forEach((data, queryIdx) => {
        const line = {
          name: key,
          data: data,
          color: graphedGroupColors[key]?.dark,
          dashed: queryIdx !== 0, // lag queries are dashed
        };

        if (queryIdx === 0) {
          series.push(line);
        } else {
          againstSeries.push(line);
        }
      });
    });

    const chartInfo: LineChartInfo = {
      aggregation: queryAgg,
      id: `${JSON.stringify(queryAgg)}-${pIdx}`,
      series: series,
      againstSeries: againstSeries,
      times: times,
      type: AggregationChartType.Line,
      empty: empty || intervalCount < 2, // charts with one interval are considered empty
      title: `${formatPercentile(queryAgg.argument[pIdx])}(${queryAgg.field})`,
      min: min,
      max: max,
    };

    charts.push(chartInfo);
  });
}

// Function to transform response data to be used in visualizations in the Totals table
function calculateVisualizations(
  allQueryResultsTotals: EntryGroup[][],
  allQueryResultsSeries: Interval[][],
  graphedGroupColors: ChartColors,
  queryAggs: Aggregation[],
  groupBy?: string[],
  queryOptions?: { [key: string]: string }
) {
  const totalsFunctions: TotalsFunction[] = new Array(queryAggs.length).fill(null);
  const totalsAccumulators: Accumulator[] = new Array(queryAggs.length).fill(null);
  const totalsResultFunctions: TotalsResultFunction[] = new Array(queryAggs.length).fill(null);

  const intervalsFunctions: IntervalsFunction[] = new Array(queryAggs.length).fill(null); // chart accum functions
  const intervalsAccumulators: Accumulator[] = new Array(queryAggs.length).fill(null); // accum objects
  const intervalsResultFunctions: IntervalsResultFunction[] = new Array(queryAggs.length).fill(null); // this would be for transforming any accumulated data into charts

  queryAggs.forEach((agg, aggIdx) => {
    switch (agg.op) {
      case Aggregation.OpEnum.Histogram:
        totalsFunctions[aggIdx] = accumulateSpectrograph;
        totalsResultFunctions[aggIdx] = summarizeSpectrograph;

        // charting
        intervalsFunctions[aggIdx] = accumulateHeatMap;
        intervalsResultFunctions[aggIdx] = chartHeatMap;

        break;
      case Aggregation.OpEnum.Count:
      case Aggregation.OpEnum.Distinct:
      case Aggregation.OpEnum.Sum:
      case Aggregation.OpEnum.Avg:
      case Aggregation.OpEnum.Min:
      case Aggregation.OpEnum.Max:
      case Aggregation.OpEnum.Stdev:
      case Aggregation.OpEnum.Variance:
        // charting
        intervalsFunctions[aggIdx] = accumulateLineChart;
        intervalsResultFunctions[aggIdx] = chartLineChart;

        break;
      case Aggregation.OpEnum.Percentiles:
        // Only handle non-grouped percentiles
        if (!groupBy?.length) {
          intervalsFunctions[aggIdx] = accumulatePercentiles;
          intervalsResultFunctions[aggIdx] = chartPercentiles;
        } else {
          intervalsFunctions[aggIdx] = accumulateGroupedPercentiles;
          intervalsResultFunctions[aggIdx] = chartGroupedPercentiles;
        }
        break;
      case Aggregation.OpEnum.Topk:
        totalsFunctions[aggIdx] = accumulateTopkChart;
        totalsResultFunctions[aggIdx] = chartTopkChart;
        break;
      default:
        break;
    }
  });

  allQueryResultsTotals.forEach((entryGroups, lagIdx) => {
    entryGroups.forEach((entryGroup, groupIdx) => {
      queryAggs.forEach((queryAgg, aggIdx) => {
        if (totalsFunctions[aggIdx]) {
          totalsAccumulators[aggIdx] = totalsFunctions[aggIdx]({
            accumulator: totalsAccumulators[aggIdx],
            queryAgg: queryAgg,
            aggIdx: aggIdx,
            entryGroup: entryGroup,
            graphedGroupColors: graphedGroupColors,
            queryCount: allQueryResultsTotals.length,
            queryIdx: lagIdx,
            value: entryGroup.aggregations && entryGroup.aggregations[aggIdx].value,
            groupBy: groupBy,
          });
        }
      });
    });
  });

  const intervalCount = allQueryResultsSeries.length ? allQueryResultsSeries[0].length : 0;

  allQueryResultsSeries.forEach((intervals, lagIdx) => {
    intervals.forEach((interval, intervalIdx) => {
      queryAggs.forEach((queryAgg, aggIdx) => {
        if (intervalsFunctions[aggIdx]) {
          intervalsAccumulators[aggIdx] =
            intervalsFunctions[aggIdx]({
              accumulator: intervalsAccumulators[aggIdx],
              queryAgg: queryAgg,
              aggIdx: aggIdx,
              graphedGroupColors: graphedGroupColors,
              interval: interval,
              queryIdx: lagIdx,
              queryCount: allQueryResultsTotals.length,
              intervalIdx: intervalIdx,
              intervalCount: intervalCount,
              queryOptions: queryOptions,
              groupBy: groupBy,
            }) || intervalsAccumulators[aggIdx];
        }
      });
    });
  });

  const processedData: { charts: AggregationChartInfo[]; summaries: AggregationSummary[] } = {
    charts: [],
    // Length of the aggregations because they are expected to be keyed by aggregation index
    summaries: queryAggs.map((agg) => ({ aggregation: agg })),
  };

  queryAggs.forEach((queryAgg, aggIdx) => {
    if (totalsResultFunctions[aggIdx] && totalsAccumulators[aggIdx]) {
      totalsResultFunctions[aggIdx]({
        queryAgg: queryAgg,
        accumulator: totalsAccumulators[aggIdx],
        aggIdx: aggIdx,
        queryCount: allQueryResultsTotals.length,
        groupBy: groupBy,
        intervalCount: intervalCount,
        ...processedData,
      });
    }

    if (intervalsResultFunctions[aggIdx] && intervalsAccumulators[aggIdx]) {
      intervalsResultFunctions[aggIdx]({
        queryAgg: queryAgg,
        accumulator: intervalsAccumulators[aggIdx],
        graphedGroupColors: graphedGroupColors,
        intervalCount: intervalCount,
        ...processedData,
      });
    }
  });

  return processedData;
}

export const hashQuery = (query: QueryRequest | APLRequestWithOptions, selectedDatasetId?: string): number => {
  if (isQueryRequest(query)) {
    // Not sure if `order` and `virtualFields` should be picked or not, but going with it for now.
    return hashCode(
      orderedStringify({
        aggregations: query.aggregations?.map((agg) => omitBy(agg, isNil)),
        filter: query.filter,
        groupBy: query.groupBy,
        order: query.order,
        virtualFields: query.virtualFields,
        dataset: selectedDatasetId,
      })
    );
  }

  return hashCode(JSON.stringify({ apl: query.apl }));
};

export interface QueryFormValues {
  aggregations: Aggregation[];
  filter: Filter;
  groupBy: string[];
  order: Order[];
}

// 🐉🐉🐉
// 🐉🐉🐉
// 🐉🐉🐉
// Have to recreate the type because the one generated from swagger is incomplete.
// KH 2021/03: Placed this at the bottom of the file because the developer tools display the whole file as a comment after the line: LessThan = <any>'<',
//
// https://github.com/axiomhq/axiom/-/blob/master/pkg/frontend/lib/axiom/api/dash/codegen/api.ts#L574
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Filter {
  export enum OpEnum {
    And = <any>'and',
    Or = <any>'or',
    // Eq = <any>'eq',
    Equal = <any>'==',
    NotEqual = <any>'!=',
    // Ne = <any>'ne',
    Exists = <any>'exists',
    NotExists = <any>'not-exists',
    GreaterThan = <any>'>',
    GreaterThanOrEqualTo = <any>'>=',
    LessThan = <any>'<',
    LessThanOrEqualTo = <any>'<=',
    // Gt = <any>'gt',
    // Gte = <any>'gte',
    // Lt = <any>'lt',
    // Lte = <any>'lte',
    StartsWith = <any>'starts-with',
    NotStartsWith = <any>'not-starts-with',
    EndsWith = <any>'ends-with',
    NotEndsWith = <any>'not-ends-with',
    Contains = <any>'contains',
    NotContains = <any>'not-contains',
    Regexp = <any>'regexp',
    NotRegexp = <any>'not-regexp',
  }
}
