// cSpell:ignore uplot idxs bbox
/* eslint-disable no-array-constructor,@typescript-eslint/no-array-constructor */
import zip from 'lodash/zip';
import React from 'react';

import { AxiomContext } from './AxiomContext';
import { ChartTooltip } from './ChartTooltip';
import { ColorTableRow } from './ColorTableRow';
import { BarSeries, LineSeries, PercentilesChartInfo, Series } from './stores/DatasetStore';
import { TooltipTable } from './TooltipTable';
import { UPlotChart, UPlotOptions, UPlotPlugin } from './UPlotChart';
import { formatIntervalDate } from './util/dates';
import { formatNumber } from './util/numbers';
import { ValueFormatter } from './util/units/valueFormats';

export interface PercentilesChartProps {
  groupId: string;
  height?: number;
  chartInfo: PercentilesChartInfo;
  className?: string;
  valueFormatter?: ValueFormatter;
}

export class PercentilesChart extends React.Component<PercentilesChartProps> {
  static contextType = AxiomContext;
  context!: React.ContextType<typeof AxiomContext>;

  render() {
    const { chartInfo, height, groupId, className, valueFormatter } = this.props;
    const { bars, times, max, lines } = chartInfo;

    if (times.length <= 1) {
      return null;
    }

    const opts = this.options();

    let totalDataLength = times.length;
    const dataLabels = times.map((t) => t / 1000); // UPlot expects time in seconds
    const barData = zip(...bars.map((b) => b.data));

    if (times.length > 1) {
      totalDataLength = totalDataLength + 1; // Because we have to add an extra tick or the last interval isn't shown
      const intervalLength = dataLabels[dataLabels.length - 1] - dataLabels[dataLabels.length - 2];
      dataLabels.push(dataLabels[dataLabels.length - 1] + intervalLength); // This is adding another interval at the end
      barData.push([]); // Add an empty bar
    }

    // This structure is what uplot expects for the x axis (timestamps, chartData[0]) and lets it handle scaling the y axis ( chartData[1], chartData[2])
    // and stores the actual interval data for use to create the bars later (chartData[3])
    const chartData = [
      dataLabels,
      // Add fake series to scale the y-axis
      new Array(totalDataLength).fill(0),
      new Array(totalDataLength).fill(max),
      // bar data zipped into [[percentile, percentile, percentile], ...] this could be done elsewhere
      barData,
      ...lines.map((line) => line.data),
    ];

    return (
      <UPlotChart
        data={chartData as any}
        groupId={groupId}
        height={height}
        options={opts}
        renderTooltip={this.renderTooltip}
        legendSeries={bars}
        className={className}
        valueFormatter={valueFormatter}
      />
    );
  }

  options = (): UPlotOptions => {
    const { chartInfo } = this.props;

    const { lines, title } = chartInfo;

    return {
      title: title,
      plugins: [this.barsPlugin()],
      series: [
        {},
        // Min/Max series
        {
          paths: () => null as any, // don't plot anything because this series is used to scale the y axis
          points: { show: false },
        },
        {
          paths: () => null as any, // don't plot anything because this series is used to scale the y axis
          points: { show: false },
        },
        // Bar series
        {
          label: 'bar',
          show: false,
        },
        ...lines.map((line) => ({ stroke: line.color, dash: line.dashed ? [5, 5] : undefined })),
      ],
      axes: [
        {
          grid: { show: false },
        },
        {
          grid: { show: true },
        },
      ],
    };
  };

  barsPlugin = (): UPlotPlugin => {
    const { bars } = this.props.chartInfo;

    return {
      hooks: {
        // on the draw hook render bars
        drawSeries: [
          (u: uPlot, seriesKey: number) => {
            // draw the bars after the y-max series has been drawn
            if (seriesKey === 2) {
              // uplot _should_ have transformed the series times data and returned it but can't be sure
              if (u.series[0] && u.series[0].idxs) {
                const [iMin, iMax] = u.series[0].idxs;
                const y0 = u.valToPos(0, 'y', true);

                for (let i = iMin; i <= iMax; i += 1) {
                  // Weird ternary from the example, might be relevant in the future
                  // https://github.com/leeoniya/uPlot/blob/master/demos/candlestick-ohlc.html
                  // const xVal = u.scales.x.distr === 2 ? i : u.data[0][i]!;
                  const xVal = u.data[0] && u.data[0][i];

                  // Check if the time is the correct type
                  if (typeof xVal === 'number') {
                    const percentiles = u.data[3][i];

                    if (Array.isArray(percentiles)) {
                      const timeAsX = u.valToPos(xVal, 'x', true);
                      const columnWidth = u.bbox.width / (iMax - iMin);

                      // For each interval render the bar centered over the tick
                      const bodyX = timeAsX;

                      let lastPercentileY: number = y0;

                      // Iterating backwards to draw the shortest line first
                      for (let barIdx = percentiles.length - 1; barIdx >= 0; barIdx -= 1) {
                        const percentile = percentiles[barIdx];
                        if (typeof percentile !== 'number') {
                          continue;
                        }
                        const percentileAsY = u.valToPos(percentile, 'y', true);

                        u.ctx.fillStyle = bars[barIdx].color;
                        const flooredPercentileY = Math.floor(percentileAsY); // Flooring this value to have whole numbers for heights/y-axis points so the stacked bars meet
                        u.ctx.fillRect(bodyX, flooredPercentileY, columnWidth, lastPercentileY - flooredPercentileY);
                        lastPercentileY = flooredPercentileY;
                      }
                    }
                  }
                }
              }
            }
          },
        ],
      },
    };
  };

  renderTooltip = (params: { x: number; y: number; u: any }) => {
    const { x, y, u } = params;

    const { timeZone } = this.context;
    const { chartInfo, valueFormatter } = this.props;
    const { bars, lines } = chartInfo;

    let xi: number | undefined;

    const intervals = u.data[0];

    // Figure out which interval the cursor is within
    for (let i = 0; i < intervals.length; i += 1) {
      if (i === intervals.length - 1) {
        xi = i;
        break;
      }

      if (x >= intervals[i] && x < intervals[i + 1]) {
        xi = i;
        break;
      }
    }

    if (xi !== undefined && top !== undefined) {
      const idx: number = xi as number; // typescript refuses to see this as a number even with the undefined check so using as to avoid a bunch of !'s

      const seriesToMap = (series: (Series | LineSeries)[]): { [key: string]: BarSeries | LineSeries } =>
        series.reduce((accum, s) => {
          accum[s.name] = s;

          return accum;
        }, {});

      // maps provide a quick way to look up a series' values from other time frames
      const barsMap = seriesToMap(bars);
      const linesMap = seriesToMap(lines);

      // allMap gives us a set of the series
      const allMap = { ...linesMap, ...barsMap };

      // Find a bar the cursor is within or the line it is closest to
      const nearestBar = bars.find((b, barIdx) => {
        if (barIdx === bars.length - 1) {
          // No bar matched
          return false;
        }

        const barValue = b.data[idx];
        const nextBarValue = bars[barIdx + 1].data[idx];

        if (y <= barValue && barValue !== null && (y > nextBarValue || nextBarValue === null)) {
          return true;
        }

        return false;
      });

      // This will prefer using the bar if the cursor is within one otherwise it'll locate the nearest line
      const nearestSeries =
        nearestBar ||
        lines
          .map((s) => {
            const val = s.data[idx];

            return {
              distance: val === null ? null : Math.abs(val - y),
              series: s,
            };
          })
          .filter((s) => s.distance !== null)
          .sort((a, b) => a.distance! - b.distance!)
          .map((s) => s.series)
          .shift();

      const time = u.data[0] && u.data[0][idx] * 1000; // Convert back to milliseconds

      if (typeof time !== 'number') {
        return null;
      }

      const rows = Object.values(allMap)
        .sort((a, b) => b.name.localeCompare(a.name))
        .map((s) => {
          const { name, color } = s;

          const barData = barsMap[name]?.data[idx];
          const lineData = linesMap[name]?.data[idx];

          // Skip missing data
          if (typeof barData !== 'number' && typeof lineData !== 'number') {
            return null;
          }

          const values: (string | null)[] = [];

          values.push(formatNumber(barData, valueFormatter));

          if (lineData) {
            values.push(formatNumber(lineData, valueFormatter));
          }

          return (
            <ColorTableRow
              key={`${idx}-${name}`}
              active={nearestSeries && nearestSeries.name === name}
              color={color}
              name={name}
              values={values}
            />
          );
        })
        .filter((row) => !!row);

      return rows.length > 0 ? (
        <ChartTooltip title={formatIntervalDate(time, timeZone)}>
          {' '}
          <TooltipTable>
            <tbody>{rows}</tbody>
          </TooltipTable>
        </ChartTooltip>
      ) : null;
    }

    // Unexpected
    return '';
  };
}
