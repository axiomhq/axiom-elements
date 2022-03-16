// cSpell:ignore uplot
import React from 'react';
import uPlot from 'uplot';

import { AxiomContext } from './AxiomContext';
import { ChartTooltip } from './ChartTooltip';
import { ColorTableRow } from './ColorTableRow';
import { LineChartInfo, LineSeries } from './stores/DatasetStore';
import { TooltipTable } from './TooltipTable';
import { calcChartHeight, getValues, UPlotChart, UPlotChartProps, UPlotOptions } from './UPlotChart';
import { formatIntervalDate } from './util/dates';
import { formatNumber } from './util/numbers';
import { getSplits } from './util/ticks';
import { ValueFormatter } from './util/units/valueFormats';

export interface LineChartProps extends Pick<UPlotChartProps, 'onResize'> {
  groupId?: string;
  chartInfo: LineChartInfo;
  height?: number | string;
  highlightedSeries?: string;
  spanGaps?: boolean;
  minYAxisLabelWidth?: number;
  className?: string;
  sparkline?: boolean;
  // Override any provided series colors
  color?: string;
  fill?: string;
  valueFormatter?: ValueFormatter;
}

const TICK_MIN = 14;
const X_AXIS_SIZE = 50;
const X_AXIS_MAGIC_PADDING = Math.ceil(X_AXIS_SIZE / 3); // uPlot ends up deriving this padding given x-axis params

function getSplitsForLineChart(props: LineChartProps): number[] | undefined {
  const { chartInfo, sparkline, height } = props;

  let pixelHeight: number | undefined;
  if (typeof height === 'number') {
    pixelHeight = height;
  } else if (typeof height === 'string' && height.endsWith('px')) {
    pixelHeight = Number(height.substring(0, height.length - 2));
  }

  if (pixelHeight === undefined) {
    return undefined;
  }

  const { title, min, max } = chartInfo;

  if (min === undefined || max === undefined) {
    return undefined;
  }

  const chartHeight = calcChartHeight(pixelHeight, !!title, !!sparkline);

  const plotHeight = chartHeight - X_AXIS_SIZE - X_AXIS_MAGIC_PADDING; // uPlot removes these amounts before calculating chart size for splits

  return getSplits(min, max, plotHeight, TICK_MIN);
}

export function getLabelsForLineChart(props: LineChartProps) {
  const splits = getSplitsForLineChart(props);

  if (!splits) {
    return undefined;
  }

  return getValues(splits, props.valueFormatter);
}

export class LineChart extends React.Component<LineChartProps> {
  static contextType = AxiomContext;
  context!: React.ContextType<typeof AxiomContext>;

  render() {
    const { groupId, className, sparkline, onResize } = this.props;
    const { times, series, againstSeries } = this.props.chartInfo;

    if (times.length <= 1) {
      return null;
    }

    const data: uPlot.AlignedData = [
      times.map((t) => t / 1000), // UPlot expects seconds
      ...series.map((s) => s.data),
      ...againstSeries.map((s) => s.data),
    ];

    return (
      <UPlotChart
        data={data}
        options={this.options()}
        renderTooltip={this.renderTooltip}
        height={this.props.height}
        groupId={groupId}
        className={className}
        sparkline={sparkline}
        onResize={onResize}
      />
    );
  }

  options = (): UPlotOptions => {
    const { highlightedSeries, chartInfo, spanGaps, minYAxisLabelWidth, color, fill, sparkline, valueFormatter } =
      this.props;
    const { series, againstSeries, title, min, max } = chartInfo;

    const showPoints = !spanGaps && !sparkline;
    const pointSize = 2;

    const otherSeriesProps: Partial<uPlot.Series> = {};
    const otherOpts: Partial<UPlotOptions> = {};

    const otherYAxisProps: Partial<uPlot.Axis> = {};
    if (typeof min === 'number' && typeof max === 'number' && min < max) {
      // The code below configures the y axis splits. The idea is to expose the getLabelsForLineChart() function so that
      // consumers can know all the labels that will be used. This config is intended to tie that function's behavior into the
      // axis config. It's close but not perfect and the getLabelsForLineChart() function works well enough on its own so
      // not using this for now.
      // otherSeriesProps.scale = 'y';
      // otherOpts.scales = {
      //   y: {
      //     auto: false,
      //     range: [min, max],
      //   },
      // };
      // const splits = getSplitsForLineChart(this.props);
      // if (splits !== undefined) {
      //   otherYAxisProps.splits = splits;
      // }
    }

    return {
      title: title,
      series: [
        {},
        ...series.map<uPlot.Series>((s) => ({
          label: s.name,
          stroke: color || s.color,
          // emphasize the highlighted series
          alpha: highlightedSeries && s.name !== highlightedSeries ? 0.2 : 1,
          dash: s.dashed ? [5, 5] : undefined,
          spanGaps: spanGaps,
          points: {
            show: showPoints,
            fill: color || s.color,
            size: pointSize,
          },
          fill: fill,
          ...otherSeriesProps,
        })),
        ...againstSeries.map<uPlot.Series>((s) => ({
          label: s.name,
          stroke: color || s.color,
          // emphasize the highlighted series
          alpha: highlightedSeries && s.name !== highlightedSeries ? 0.2 : 1,
          dash: s.dashed ? [5, 5] : undefined,
          spanGaps: spanGaps,
          points: {
            show: showPoints,
            fill: color || s.color,
            size: pointSize,
          },
          fill: fill,
          ...otherSeriesProps,
        })),
      ],
      axes: [
        {
          grid: { show: false },
          size: X_AXIS_SIZE,
        },
        {
          grid: { show: true },
          size: minYAxisLabelWidth !== undefined ? Math.max(minYAxisLabelWidth, 50) : 50, // If the size is too small the chart axis will get cut off
          space: TICK_MIN,
          values: (self: uPlot, splits: number[], axisIdx: number, foundSpace: number, foundIncr: number) => {
            return getValues(splits, valueFormatter);
          },
          ...otherYAxisProps,
        },
      ],
      ...otherOpts,
    };
  };

  renderTooltip = (params: { x: number; y: number; u: uPlot; idx?: number; top?: number }) => {
    const { y: yVal, idx, top } = params;

    const { timeZone } = this.context;
    const { chartInfo, valueFormatter } = this.props;
    const { series, againstSeries, times } = chartInfo;

    if (idx !== undefined && top !== undefined) {
      const mapSeriesToMap = (series_: LineSeries[]): { [key: string]: LineSeries } => {
        return series_.reduce((accum, line) => {
          accum[line.name] = line;

          return accum;
        }, {});
      };

      // Maps for looking up data from the primary or against query
      const seriesMap = mapSeriesToMap(series);
      const againstSeriesMap = mapSeriesToMap(againstSeries);

      // De-duped map of all series
      const allSeries = { ...againstSeriesMap, ...seriesMap };

      const nearestSeries = [...series, ...againstSeries]
        .map((s) => {
          const val = s.data[idx];

          return {
            distance: val === null ? null : Math.abs(val - yVal),
            series: s,
          };
        })
        .filter((s) => s.distance !== null)
        .sort((a, b) => a.distance! - b.distance!)
        .shift();

      // Get rows for tooltip
      const rows = Object.values(allSeries).map((s) => {
        const { name, color } = s;

        const sData = seriesMap[name]?.data[idx];
        const aData = againstSeriesMap[name]?.data[idx];

        if (typeof sData !== 'number' && typeof aData !== 'number') {
          return null;
        }

        const values: (string | null)[] = [typeof sData === 'number' ? formatNumber(sData, valueFormatter) : null];

        if (typeof aData === 'number') {
          values.push(formatNumber(aData, valueFormatter));
        }

        return (
          <ColorTableRow
            key={`${idx}-${name}`}
            active={nearestSeries && nearestSeries.series.name === name}
            color={color}
            name={name}
            values={values}
          />
        );
      });

      const rowCount = rows.filter((row) => !!row).length;

      return rowCount === 0 ? null : (
        <ChartTooltip title={formatIntervalDate(times[idx], timeZone)}>
          <TooltipTable>
            <tbody>{rows}</tbody>
          </TooltipTable>
        </ChartTooltip>
      );
    }

    return '';
  };
}
