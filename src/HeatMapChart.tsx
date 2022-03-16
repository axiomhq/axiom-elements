// cSpell:ignore uplot idxs bbox
/* eslint-disable no-array-constructor,@typescript-eslint/no-array-constructor */
import Color from 'color-js/color';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';

import { AxiomContext } from './AxiomContext';
import { ChartTooltip } from './ChartTooltip';
import { ColorTableRow } from './ColorTableRow';
import { ColorScale, HeatMapChartInfo } from './stores/DatasetStore';
import { TooltipTable } from './TooltipTable';
import { UPlotChart, UPlotOptions, UPlotPlugin } from './UPlotChart';
import { formatIntervalDate } from './util/dates';
import { formatNumber } from './util/numbers';
import { ValueFormatter } from './util/units/valueFormats';

function fillStyle(value: number, colorScales: ColorScale[] | undefined) {
  if (!colorScales) {
    return undefined;
  }

  const colorScale = colorScales.find(({ from: colorFrom, to: colorTo }, index) => {
    return (
      value === colorFrom ||
      (value > colorFrom && value < colorTo) ||
      (index === colorScales.length - 1 && value === colorTo)
    );
  });

  if (!colorScale) {
    return undefined;
  }

  const { to, from, color } = colorScale;

  // need to iterate over the color and darken or lighten it depending on how many increments it is removed from the halfway point
  const range = to - from;

  const halfway = range / 2 + from;
  let start = value > halfway ? halfway : value;
  const end = value > halfway ? value : halfway;

  const increment = range / 5;

  let adjustedColor = Color(color);
  for (; end - start > increment; start += increment) {
    if (value > halfway) {
      adjustedColor = adjustedColor.darkenByRatio(0.2);
    } else {
      adjustedColor = adjustedColor.lightenByRatio(0.2);
    }
  }

  return adjustedColor.toCSS();
}

export interface HeatMapChartProps {
  groupId: string;
  chartInfo: HeatMapChartInfo;
  height?: number;
  highlightedSeries?: string;
  className?: string;
  valueFormatter?: ValueFormatter;
}

export class HeatMapChart extends React.Component<HeatMapChartProps> {
  static contextType = AxiomContext;
  context!: React.ContextType<typeof AxiomContext>;

  render() {
    const { chartInfo, height, highlightedSeries, groupId, className, valueFormatter } = this.props;
    const { groupSeries, buckets, labels, groupColorScales } = chartInfo;

    if (labels.length <= 1) {
      return null;
    }

    const opts = this.options();

    // Default to the all series ''
    const data = (highlightedSeries && groupSeries[highlightedSeries]) || groupSeries[''] || [];
    const colorScales = (highlightedSeries && groupColorScales[highlightedSeries]) || groupColorScales[''] || [];

    let totalDataLength = data.length;
    const dataLabels = labels.map((l) => l / 1000); // UPlot expects times in seconds
    const cellData = [...data];

    // Add an extra interval because the chart will end at the final interval without showing it
    if (dataLabels.length > 1) {
      totalDataLength = totalDataLength + 1; // Because we have to add an extra tick or the last interval data isn't shown
      const intervalLength = dataLabels[dataLabels.length - 1] - dataLabels[dataLabels.length - 2];
      dataLabels.push(dataLabels[dataLabels.length - 1] + intervalLength); // This is adding another interval at the end
      cellData.push(cloneDeep(cellData[cellData.length - 1])); // Copies that last intervals values which won't be rendered but this way won't be undefined
    }

    // This structure is what uplot expects for the x axis (timestamps, chartData[0]) and lets it handle scaling the y axis ( chartData[1], chartData[2])
    // and stores the actual interval data for use to create the blocks later (chartData[3])
    const chartData = [
      dataLabels,
      new Array(totalDataLength).fill(buckets[0]?.from || 0),
      new Array(totalDataLength).fill(buckets[buckets.length - 1]?.to || 0),
      cellData,
    ];

    // first bucket is for 0 so don't need row
    const nonZeroColorScales = colorScales.length > 1 ? colorScales.slice(1) : colorScales;

    const legendSeries = nonZeroColorScales
      .map(({ from, to, color }, idx) => {
        const prefix = from < to ? '<' : ''; // don't need the '<' when 'from' equals 'to'. Happens where the count values are all the same.

        return { name: `${prefix}${Math.floor(to)}`, color: color };
      })
      .reverse();

    return (
      <UPlotChart
        data={chartData as any}
        groupId={groupId}
        height={height}
        options={opts}
        legendSeries={legendSeries}
        renderTooltip={this.renderTooltip}
        className={className}
        valueFormatter={valueFormatter}
      />
    );
  }

  options = (): UPlotOptions => {
    const { chartInfo } = this.props;
    const { title } = chartInfo;

    return {
      title: title,
      plugins: [this.heatMapPlugin()],
      series: [
        {},
        {
          paths: () => null as any, // don't plot anything because this series is used to scale the y axis
          points: { show: false },
        },
        {
          paths: () => null, // don't plot anything because this series is used to scale the y axis
          points: { show: false },
        },
      ],
      axes: [
        {
          grid: { show: false },
        },
        {
          grid: { show: false },
        },
      ],
    };
  };

  heatMapPlugin = (): UPlotPlugin => {
    const { highlightedSeries } = this.props;
    const { buckets, groupColorScales } = this.props.chartInfo;
    const selectedSeries = highlightedSeries || '';
    const colorScales = groupColorScales[selectedSeries];

    return {
      hooks: {
        // on the draw hook render heat map cells
        draw: [
          (u: uPlot) => {
            const { ctx, data } = u;

            // uplot _should_ have transformed the series times data and returned it but can't be sure
            if (u.series[0] && u.series[0].idxs) {
              const [iMin, iMax] = u.series[0].idxs;
              const yData = data[3];

              for (let i = iMin; i < iMax; i += 1) {
                const yValues = yData[i];
                const xVal = u.data[0] && u.data[0][i];

                // Check if the time is the correct type
                if (typeof xVal === 'number') {
                  const timeAsX = Math.floor(u.valToPos(xVal, 'x', true));

                  const nextTimeAsX =
                    u.data[0] && u.data[0].length > i + 1
                      ? Math.floor(u.valToPos(u.data[0][i + 1], 'x', true))
                      : undefined;

                  const bodyWidth =
                    nextTimeAsX !== undefined
                      ? nextTimeAsX - timeAsX
                      : // Compute column width
                        Math.floor(u.bbox.width / (iMax - iMin));

                  // Have to do this because we're using a weird format to create the heat map (taken straight from an example)
                  const unknownValues = yValues as unknown;

                  (unknownValues as number[]).forEach((yQty, yi) => {
                    // For each interval render the bar starting at the tick
                    const bodyX = timeAsX;

                    const bucket = buckets[yi];

                    if (bucket) {
                      const { from, to } = bucket;

                      const yHgt = Math.floor(u.valToPos(to, 'y', true) - u.valToPos(from, 'y', true));
                      const yPos = u.valToPos(from, 'y', true);

                      ctx.fillStyle = fillStyle(yQty, colorScales) || ''; // Might not have been able to calculate a fill style
                      u.ctx.fillRect(bodyX, yPos, bodyWidth, yHgt);
                    }
                  });
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
    const { chartInfo, highlightedSeries, valueFormatter } = this.props;
    const selectedSeries = highlightedSeries || '';
    const { buckets } = this.props.chartInfo;

    // Now we have to figure out which series they're hovered over. Omg.
    let xi: number | undefined;
    let yi: number | undefined;

    const intervals = u.data[0];

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

    if (xi !== undefined) {
      for (let j = 0; j < buckets.length; j += 1) {
        const bucket = buckets[j];

        if (bucket) {
          const { to, from } = bucket;

          if (y === from || (y > from && y < to) || (j === buckets.length - 1 && y === to)) {
            yi = j;
            break;
          }
        }
      }

      if (yi !== undefined) {
        const intervalData = u.data[3][xi];

        return (
          <ChartTooltip title={formatIntervalDate(chartInfo.labels[xi], timeZone)}>
            <TooltipTable>
              <tbody>
                {intervalData
                  .map((value: number, i: number) => {
                    const active = yi === i;

                    // Find the color bucket for this value
                    const { groupColorScales } = chartInfo;
                    const colorScales = groupColorScales[selectedSeries];

                    const color = fillStyle(value, colorScales);

                    const bucket = buckets[i];

                    const name = bucket ? formatNumber(bucket.to, valueFormatter) : '';

                    return (
                      <ColorTableRow
                        key={`${i}-${xi}`}
                        active={active}
                        color={color}
                        name={name}
                        values={[`${value}`]}
                      />
                    );
                  })
                  .reverse()}
              </tbody>
            </TooltipTable>
          </ChartTooltip>
        );
      }
    }

    // Unexpected
    return '';
  };
}
